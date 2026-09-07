package com.example.preciousmetals.valuation;

import com.example.preciousmetals.auth.model.User;
import com.example.preciousmetals.portfolio.model.Portfolio;
import com.example.preciousmetals.portfolio.repository.PortfolioRepository;
import com.example.preciousmetals.transaction.model.Transaction;
import com.example.preciousmetals.transaction.repository.TransactionRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PortfolioValuationService {

  private static final Logger log = LoggerFactory.getLogger(PortfolioValuationService.class);

  private final PortfolioRepository portfolioRepository;
  private final TransactionRepository transactionRepository;
  private final ValuationService valuationService;
  private final PortfolioValuationCache cache;

  public PortfolioValuationService(
      PortfolioRepository portfolioRepository,
      TransactionRepository transactionRepository,
      ValuationService valuationService) {
    this(
        portfolioRepository,
        transactionRepository,
        valuationService,
        new NoOpPortfolioValuationCache());
  }

  @Autowired
  public PortfolioValuationService(
      PortfolioRepository portfolioRepository,
      TransactionRepository transactionRepository,
      ValuationService valuationService,
      PortfolioValuationCache cache) {
    this.portfolioRepository = portfolioRepository;
    this.transactionRepository = transactionRepository;
    this.valuationService = valuationService;
    this.cache = cache;
  }

  @Transactional(readOnly = true)
  public ValuationResult getValue(User user, UUID portfolioId) {
    Portfolio portfolio = portfolioRepository.findByIdAndOwner(portfolioId, user).orElseThrow();
    return getValue(portfolio, portfolioId);
  }

  @Transactional(readOnly = true)
  public ValuationResult getValue(Portfolio portfolio) {
    return getValue(portfolio, portfolio.getId());
  }

  private ValuationResult getValue(Portfolio portfolio, UUID portfolioId) {
    if (portfolioId == null) {
      return calculateCurrent(portfolio);
    }

    Optional<CachedPortfolioValuation> cached = cache.get(portfolioId);
    if (cached.isPresent()) {
      return cached.get().valuation();
    }

    ValuationResult calculated = calculateCurrent(portfolio);
    cache.put(portfolioId, new CachedPortfolioValuation(calculated, calculated.valuedAt(), Optional.empty()));
    return calculated;
  }

  public void evictCache(UUID portfolioId) {
    cache.evict(portfolioId);
  }

  private ValuationResult calculateCurrent(Portfolio portfolio) {
    OffsetDateTime asOf = OffsetDateTime.now(ZoneOffset.UTC);
    List<Transaction> transactions =
        transactionRepository.findAllByPortfolioOrderByTransactionDateAscCreatedAtAsc(portfolio);
    return valuationService.valueAsOf(transactions, asOf);
  }

  private static final class NoOpPortfolioValuationCache implements PortfolioValuationCache {
    @Override
    public Optional<CachedPortfolioValuation> get(UUID portfolioId) {
      return Optional.empty();
    }

    @Override
    public void put(UUID portfolioId, CachedPortfolioValuation valuation) {}

    @Override
    public void evict(UUID portfolioId) {}
  }
}
