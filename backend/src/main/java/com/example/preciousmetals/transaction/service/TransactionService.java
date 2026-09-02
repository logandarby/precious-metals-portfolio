package com.example.preciousmetals.transaction.service;

import com.example.preciousmetals.auth.model.User;
import com.example.preciousmetals.portfolio.model.Portfolio;
import com.example.preciousmetals.portfolio.service.PortfolioService;
import com.example.preciousmetals.transaction.dto.CreateTransactionRequest;
import com.example.preciousmetals.transaction.dto.CreateTransactionsRequest;
import com.example.preciousmetals.transaction.dto.TransactionResponse;
import com.example.preciousmetals.transaction.model.Transaction;
import com.example.preciousmetals.transaction.repository.TransactionRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionService {

  private final PortfolioService portfolioService;
  private final TransactionRepository transactionRepository;

  public TransactionService(
      PortfolioService portfolioService, TransactionRepository transactionRepository) {
    this.portfolioService = portfolioService;
    this.transactionRepository = transactionRepository;
  }

  @Transactional(readOnly = true)
  public List<TransactionResponse> listTransactions(User user, UUID portfolioId) {
    Portfolio portfolio = portfolioService.requirePortfolio(user, portfolioId);
    return transactionRepository
        .findAllByPortfolioOrderByTransactionDateAscCreatedAtAsc(portfolio)
        .stream()
        .map(TransactionResponse::from)
        .toList();
  }

  @Transactional
  public List<TransactionResponse> createTransactions(
      User user, UUID portfolioId, CreateTransactionsRequest request) {
    Portfolio portfolio = portfolioService.requirePortfolio(user, portfolioId);
    return request.transactions().stream()
        .map(item -> TransactionResponse.from(transactionRepository.saveAndFlush(toEntity(portfolio, item))))
        .toList();
  }

  private static Transaction toEntity(Portfolio portfolio, CreateTransactionRequest request) {
    return new Transaction(
        portfolio,
        request.metal(),
        request.quantity(),
        request.unit(),
        request.purchasePrice(),
        request.transactionDate());
  }
}
