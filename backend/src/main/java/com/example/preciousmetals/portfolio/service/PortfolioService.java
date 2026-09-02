package com.example.preciousmetals.portfolio.service;

import com.example.preciousmetals.auth.model.User;
import com.example.preciousmetals.portfolio.dto.CreatePortfolioRequest;
import com.example.preciousmetals.portfolio.dto.UpdatePortfolioRequest;
import com.example.preciousmetals.portfolio.dto.HistoryPointResponse;
import com.example.preciousmetals.portfolio.dto.PortfolioListResponse;
import com.example.preciousmetals.portfolio.dto.PortfolioResponse;
import com.example.preciousmetals.portfolio.exception.PortfolioNotFoundException;
import com.example.preciousmetals.portfolio.model.HistoryRange;
import com.example.preciousmetals.portfolio.model.Portfolio;
import com.example.preciousmetals.portfolio.repository.PortfolioRepository;
import com.example.preciousmetals.transaction.model.Transaction;
import com.example.preciousmetals.transaction.repository.TransactionRepository;
import com.example.preciousmetals.valuation.ValuationResult;
import com.example.preciousmetals.valuation.ValuationService;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PortfolioService {

  private final PortfolioRepository portfolioRepository;
  private final TransactionRepository transactionRepository;
  private final ValuationService valuationService;

  public PortfolioService(
      PortfolioRepository portfolioRepository,
      TransactionRepository transactionRepository,
      ValuationService valuationService) {
    this.portfolioRepository = portfolioRepository;
    this.transactionRepository = transactionRepository;
    this.valuationService = valuationService;
  }

  @Transactional(readOnly = true)
  public PortfolioListResponse listPortfolios(User user) {
    LocalDate today = LocalDate.now();
    List<PortfolioResponse> portfolios =
        portfolioRepository.findAllByOwnerOrderByCreatedAtAsc(user).stream()
            .map(portfolio -> toResponse(portfolio, today))
            .toList();
    return PortfolioListResponse.from(portfolios);
  }

  @Transactional
  public PortfolioResponse createPortfolio(User user, CreatePortfolioRequest request) {
    Portfolio portfolio = portfolioRepository.saveAndFlush(new Portfolio(request.name(), user));
    return toResponse(portfolio, LocalDate.now());
  }

  @Transactional(readOnly = true)
  public PortfolioResponse getPortfolio(User user, UUID portfolioId) {
    return toResponse(requirePortfolio(user, portfolioId), LocalDate.now());
  }

  @Transactional
  public PortfolioResponse renamePortfolio(
      User user, UUID portfolioId, UpdatePortfolioRequest request) {
    Portfolio portfolio = requirePortfolio(user, portfolioId);
    portfolio.rename(request.name());
    return toResponse(portfolioRepository.saveAndFlush(portfolio), LocalDate.now());
  }

  @Transactional
  public void deletePortfolio(User user, UUID portfolioId) {
    Portfolio portfolio = requirePortfolio(user, portfolioId);
    transactionRepository.deleteAllByPortfolio(portfolio);
    portfolioRepository.delete(portfolio);
  }

  @Transactional(readOnly = true)
  public ValuationResult getValue(User user, UUID portfolioId) {
    Portfolio portfolio = requirePortfolio(user, portfolioId);
    return valuationService.valueAsOf(transactionsOf(portfolio), LocalDate.now());
  }

  @Transactional(readOnly = true)
  public List<HistoryPointResponse> getHistory(User user, UUID portfolioId) {
    return getHistory(user, portfolioId, HistoryRange.ALL);
  }

  @Transactional(readOnly = true)
  public List<HistoryPointResponse> getHistory(
      User user, UUID portfolioId, HistoryRange range) {
    Portfolio portfolio = requirePortfolio(user, portfolioId);
    List<Transaction> transactions = transactionsOf(portfolio);
    if (transactions.isEmpty()) {
      return List.of();
    }
    LocalDate firstPurchase =
        transactions.stream()
            .map(Transaction::getTransactionDate)
            .min(LocalDate::compareTo)
            .orElseThrow();
    LocalDate end = LocalDate.now();
    LocalDate start = range.startDate(end, firstPurchase);
    if (start.isAfter(end)) {
      return List.of();
    }
    List<HistoryPointResponse> points = new ArrayList<>();
    for (LocalDate date = start; !date.isAfter(end); date = date.plus(range.step())) {
      points.add(
          new HistoryPointResponse(date, valuationService.valueAsOf(transactions, date).value()));
    }
    if (!points.getLast().date().equals(end)) {
      points.add(
          new HistoryPointResponse(end, valuationService.valueAsOf(transactions, end).value()));
    }
    return points;
  }

  public Portfolio requirePortfolio(User user, UUID portfolioId) {
    return portfolioRepository
        .findByIdAndOwner(portfolioId, user)
        .orElseThrow(PortfolioNotFoundException::new);
  }

  private PortfolioResponse toResponse(Portfolio portfolio, LocalDate asOf) {
    return PortfolioResponse.from(
        portfolio, valuationService.valueAsOf(transactionsOf(portfolio), asOf));
  }

  private List<Transaction> transactionsOf(Portfolio portfolio) {
    return transactionRepository.findAllByPortfolioOrderByTransactionDateAscCreatedAtAsc(portfolio);
  }
}
