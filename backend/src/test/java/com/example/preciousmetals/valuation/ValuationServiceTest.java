package com.example.preciousmetals.valuation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import com.example.preciousmetals.common.model.Metal;
import com.example.preciousmetals.common.model.WeightUnit;
import com.example.preciousmetals.market.MarketPriceProvider;
import com.example.preciousmetals.portfolio.model.Portfolio;
import com.example.preciousmetals.transaction.model.Transaction;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

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
            LocalDate.of(2026, 1, 1));

    ValuationResult result = service.valueAsOf(List.of(purchase), LocalDate.of(2026, 2, 1));

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
            LocalDate.of(2026, 1, 1));
    Transaction february =
        new Transaction(
            portfolio,
            Metal.GOLD,
            new BigDecimal("1"),
            WeightUnit.TROY_OUNCE,
            new BigDecimal("3000"),
            LocalDate.of(2026, 2, 1));

    ValuationResult result =
        service.valueAsOf(List.of(january, february), LocalDate.of(2026, 1, 15));

    assertThat(result.value()).isEqualByComparingTo("6400.00");
    assertThat(result.costBasis()).isEqualByComparingTo("5000.00");
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
            LocalDate.of(2026, 1, 1));
    Transaction silver =
        new Transaction(
            portfolio,
            Metal.SILVER,
            new BigDecimal("20"),
            WeightUnit.TROY_OUNCE,
            new BigDecimal("800"),
            LocalDate.of(2026, 1, 2));

    ValuationResult result = service.valueAsOf(List.of(gold, silver), LocalDate.of(2026, 2, 1));

    assertThat(result.value()).isEqualByComparingTo("7000.00");
    assertThat(result.allocation().get(Metal.GOLD)).isEqualByComparingTo("85.71");
    assertThat(result.allocation().get(Metal.SILVER)).isEqualByComparingTo("14.29");
  }
}
