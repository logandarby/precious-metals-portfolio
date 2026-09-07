package com.example.preciousmetals.valuation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import com.example.preciousmetals.common.model.Metal;
import com.example.preciousmetals.common.model.WeightUnit;
import com.example.preciousmetals.auth.model.User;
import com.example.preciousmetals.market.MarketPriceProvider;
import com.example.preciousmetals.portfolio.dto.HistoryPointResponse;
import com.example.preciousmetals.portfolio.model.HistoryRange;
import com.example.preciousmetals.portfolio.model.Portfolio;
import com.example.preciousmetals.portfolio.repository.PortfolioRepository;
import com.example.preciousmetals.portfolio.service.PortfolioService;
import com.example.preciousmetals.transaction.model.Transaction;
import com.example.preciousmetals.transaction.repository.TransactionRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class ValuationServiceTest {

  @Test
  void valuesGoldHoldingAgainstSpotPrice() {
    ValuationService service =
        new ValuationService((metal, date) -> Optional.of(new BigDecimal("3200")));
    Portfolio portfolio = new Portfolio("Test");
    Transaction purchase =
        new Transaction(
            portfolio,
            Metal.GOLD,
            new BigDecimal("2"),
            WeightUnit.TROY_OUNCE,
            new BigDecimal("5000"),
            OffsetDateTime.parse("2026-01-01T12:00:00Z"));

    ValuationResult result =
        service.valueAsOf(List.of(purchase), OffsetDateTime.parse("2026-02-01T12:00:00Z"));

    assertThat(result.value()).isEqualByComparingTo("6400.00");
    assertThat(result.costBasis()).isEqualByComparingTo("5000.00");
    assertThat(result.gain()).isEqualByComparingTo("1400.00");
    assertThat(result.returnPercent()).isEqualByComparingTo("28.00");
    assertThat(result.allocation().get(Metal.GOLD)).isEqualByComparingTo("100.00");
  }

  @Test
  void ignoresPurchasesAfterTheValuationDate() {
    ValuationService service =
        new ValuationService((metal, date) -> Optional.of(new BigDecimal("3200")));
    Portfolio portfolio = new Portfolio("Test");
    Transaction january =
        new Transaction(
            portfolio,
            Metal.GOLD,
            new BigDecimal("2"),
            WeightUnit.TROY_OUNCE,
            new BigDecimal("5000"),
            OffsetDateTime.parse("2026-01-01T12:00:00Z"));
    Transaction february =
        new Transaction(
            portfolio,
            Metal.GOLD,
            new BigDecimal("1"),
            WeightUnit.TROY_OUNCE,
            new BigDecimal("3000"),
            OffsetDateTime.parse("2026-02-01T12:00:00Z"));

    ValuationResult result =
        service.valueAsOf(
            List.of(january, february), OffsetDateTime.parse("2026-01-15T12:00:00Z"));

    assertThat(result.value()).isEqualByComparingTo("6400.00");
    assertThat(result.costBasis()).isEqualByComparingTo("5000.00");
  }

  @Test
  void usesMostRecentKnownPriceBeforeTheRequestedDate() {
    MarketPriceProvider prices =
        (metal, date) ->
            Optional.of(
                switch (date.toString().substring(0, 10)) {
                  case "2026-01-02" -> new BigDecimal("100");
                  case "2026-01-07" -> new BigDecimal("110");
                  case "2026-01-09" -> new BigDecimal("150");
                  default -> new BigDecimal("200");
                });
    ValuationService service = new ValuationService(prices);
    Portfolio portfolio = new Portfolio("Test");
    Transaction purchase =
        new Transaction(
            portfolio,
            Metal.GOLD,
            new BigDecimal("1"),
            WeightUnit.TROY_OUNCE,
            new BigDecimal("50"),
            OffsetDateTime.parse("2026-01-01T12:00:00Z"));

    assertThat(
            service
                .valueAsOf(List.of(purchase), OffsetDateTime.parse("2026-01-02T12:00:00Z"))
                .value())
        .isEqualByComparingTo("100.00");
    assertThat(
            service
                .valueAsOf(List.of(purchase), OffsetDateTime.parse("2026-01-07T12:00:00Z"))
                .value())
        .isEqualByComparingTo("110.00");
    assertThat(
            service
                .valueAsOf(List.of(purchase), OffsetDateTime.parse("2026-01-09T12:00:00Z"))
                .value())
        .isEqualByComparingTo("150.00");
  }

  @Test
  void getHistoryStillReturnsWeeklyChunksEvenWithSparsePriceCoverage() {
    PortfolioRepository portfolioRepository = Mockito.mock(PortfolioRepository.class);
    TransactionRepository transactionRepository = Mockito.mock(TransactionRepository.class);
    ValuationService valuationService =
        new ValuationService(
            (metal, date) ->
                Optional.of(
                    switch (date.toString().substring(0, 10)) {
                      case "2026-01-01" -> new BigDecimal("100");
                      case "2026-01-08" -> new BigDecimal("110");
                      case "2026-01-15" -> new BigDecimal("125");
                      default -> new BigDecimal("140");
                    }));
    PortfolioService service =
        new PortfolioService(portfolioRepository, transactionRepository, valuationService);
    User user = new User("user@example.com", "encoded-password");
    Portfolio portfolio = new Portfolio("Test");
    UUID portfolioId = UUID.randomUUID();

    Mockito.when(portfolioRepository.findByIdAndOwner(portfolioId, user)).thenReturn(Optional.of(portfolio));
    Transaction purchase =
        new Transaction(
            portfolio,
            Metal.GOLD,
            new BigDecimal("1"),
            WeightUnit.TROY_OUNCE,
            new BigDecimal("50"),
            OffsetDateTime.parse("2026-01-01T12:00:00Z"));
    Mockito.when(transactionRepository.findAllByPortfolioOrderByTransactionDateAscCreatedAtAsc(portfolio))
        .thenReturn(List.of(purchase));

    List<HistoryPointResponse> points = service.getHistory(user, portfolioId, HistoryRange.ALL);

    assertThat(points).isNotEmpty();
    for (int index = 1; index < points.size() - 1; index++) {
          assertThat(
              ChronoUnit.DAYS.between(
                  points.get(index - 1).date(), points.get(index).date())
              % 7)
          .isZero();
    }
  }

  @Test
  void convertsGramsToTroyOunces() {
    assertThat(ValuationService.toTroyOunces(WeightUnit.GRAMS_PER_TROY_OUNCE, WeightUnit.GRAM))
        .isCloseTo(BigDecimal.ONE, within(new BigDecimal("0.0000001")));
  }

  @Test
  void allocatesValueAcrossMetals() {
    MarketPriceProvider prices =
        (metal, date) ->
            Optional.of(
                switch (metal) {
                  case GOLD -> new BigDecimal("3000");
                  case SILVER -> new BigDecimal("50");
                  default -> BigDecimal.ZERO;
                });
    ValuationService service = new ValuationService(prices);
    Portfolio portfolio = new Portfolio("Test");
    Transaction gold =
        new Transaction(
            portfolio,
            Metal.GOLD,
            new BigDecimal("2"),
            WeightUnit.TROY_OUNCE,
            new BigDecimal("5000"),
            OffsetDateTime.parse("2026-01-01T12:00:00Z"));
    Transaction silver =
        new Transaction(
            portfolio,
            Metal.SILVER,
            new BigDecimal("20"),
            WeightUnit.TROY_OUNCE,
            new BigDecimal("800"),
            OffsetDateTime.parse("2026-01-02T12:00:00Z"));

    ValuationResult result =
        service.valueAsOf(List.of(gold, silver), OffsetDateTime.parse("2026-02-01T12:00:00Z"));

    assertThat(result.value()).isEqualByComparingTo("7000.00");
    assertThat(result.allocation().get(Metal.GOLD)).isEqualByComparingTo("85.71");
    assertThat(result.allocation().get(Metal.SILVER)).isEqualByComparingTo("14.29");
  }
}
