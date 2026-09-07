package com.example.preciousmetals.portfolio.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.preciousmetals.auth.model.User;
import com.example.preciousmetals.common.model.Metal;
import com.example.preciousmetals.common.model.WeightUnit;
import com.example.preciousmetals.portfolio.model.Portfolio;
import com.example.preciousmetals.portfolio.repository.PortfolioRepository;
import com.example.preciousmetals.transaction.model.Transaction;
import com.example.preciousmetals.transaction.repository.TransactionRepository;
import com.example.preciousmetals.valuation.CachedPortfolioValuation;
import com.example.preciousmetals.valuation.PortfolioValuationCache;
import com.example.preciousmetals.valuation.PortfolioValuationService;
import com.example.preciousmetals.valuation.ValuationResult;
import com.example.preciousmetals.valuation.ValuationService;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class PortfolioValuationServiceTest {

  @Test
  void cacheHitReturnsCachedValuationWithoutRecalculation() {
    PortfolioRepository portfolioRepository = mock(PortfolioRepository.class);
    TransactionRepository transactionRepository = mock(TransactionRepository.class);
    PortfolioValuationCache cache = mock(PortfolioValuationCache.class);
    ValuationService valuationService = mock(ValuationService.class);
    PortfolioValuationService service =
        new PortfolioValuationService(
            portfolioRepository, transactionRepository, valuationService, cache);

    User user = new User("user@example.com", "encoded-password");
    Portfolio portfolio = new Portfolio("Retirement", user);
    UUID portfolioId = UUID.randomUUID();
    portfolio = new Portfolio("Retirement");
    when(portfolioRepository.findByIdAndOwner(portfolioId, user)).thenReturn(Optional.of(portfolio));

    OffsetDateTime valuedAt = OffsetDateTime.parse("2026-09-06T12:30:00Z");
    ValuationResult cached =
        new ValuationResult(
            new BigDecimal("1234.56"),
            new BigDecimal("1000.00"),
            new BigDecimal("234.56"),
            new BigDecimal("23.46"),
            Map.of(Metal.GOLD, new BigDecimal("100.00")),
            valuedAt);
    when(cache.get(portfolioId)).thenReturn(Optional.of(new CachedPortfolioValuation(cached, valuedAt, Optional.empty())));

    ValuationResult result = service.getValue(user, portfolioId);

    assertThat(result.valuedAt()).isEqualTo(valuedAt);
    assertThat(result.value()).isEqualByComparingTo("1234.56");
    verify(valuationService, never()).valueAsOf(any(), any());
  }

  @Test
  void cacheMissCalculatesAndStoresValuation() {
    PortfolioRepository portfolioRepository = mock(PortfolioRepository.class);
    TransactionRepository transactionRepository = mock(TransactionRepository.class);
    PortfolioValuationCache cache = mock(PortfolioValuationCache.class);
    ValuationService valuationService = mock(ValuationService.class);
    PortfolioValuationService service =
        new PortfolioValuationService(
            portfolioRepository, transactionRepository, valuationService, cache);

    User user = new User("user@example.com", "encoded-password");
    Portfolio portfolio = new Portfolio("Retirement", user);
    UUID portfolioId = UUID.randomUUID();
    when(portfolioRepository.findByIdAndOwner(portfolioId, user)).thenReturn(Optional.of(portfolio));
    when(transactionRepository.findAllByPortfolioOrderByTransactionDateAscCreatedAtAsc(portfolio))
        .thenReturn(List.of(new Transaction(portfolio, Metal.GOLD, new BigDecimal("1"), WeightUnit.TROY_OUNCE, new BigDecimal("1000"), OffsetDateTime.parse("2026-01-01T00:00:00Z"))));
    ValuationResult calculated =
        new ValuationResult(
            new BigDecimal("3200.00"),
            new BigDecimal("1000.00"),
            new BigDecimal("2200.00"),
            new BigDecimal("220.00"),
            Map.of(Metal.GOLD, new BigDecimal("100.00")),
            OffsetDateTime.parse("2026-09-06T12:30:00Z"));
    when(valuationService.valueAsOf(any(), any())).thenReturn(calculated);
    when(cache.get(portfolioId)).thenReturn(Optional.empty());

    ValuationResult result = service.getValue(user, portfolioId);

    assertThat(result.value()).isEqualByComparingTo("3200.00");
    verify(cache).put(eq(portfolioId), any(CachedPortfolioValuation.class));
  }
}
