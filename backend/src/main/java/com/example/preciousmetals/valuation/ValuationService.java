package com.example.preciousmetals.valuation;

import com.example.preciousmetals.common.model.Metal;
import com.example.preciousmetals.common.model.WeightUnit;
import com.example.preciousmetals.market.MarketPriceProvider;
import com.example.preciousmetals.transaction.model.Transaction;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class ValuationService {

  private static final int MONEY_SCALE = 2;
  private static final int PERCENT_SCALE = 2;
  private static final int QTY_SCALE = 8;

  private final MarketPriceProvider marketPriceProvider;

  public ValuationService(MarketPriceProvider marketPriceProvider) {
    this.marketPriceProvider = marketPriceProvider;
  }

  public ValuationResult valueAsOf(List<Transaction> transactions, LocalDate asOf) {
    List<Transaction> included =
        transactions.stream()
            .filter(transaction -> !transaction.getTransactionDate().isAfter(asOf))
            .toList();

    BigDecimal costBasis =
        money(
            included.stream()
                .map(Transaction::getPurchasePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

    Map<Metal, BigDecimal> ouncesByMetal = new EnumMap<>(Metal.class);
    for (Transaction transaction : included) {
      ouncesByMetal.merge(transaction.getMetal(), toTroyOunces(transaction), BigDecimal::add);
    }

    Map<Metal, BigDecimal> valueByMetal = new EnumMap<>(Metal.class);
    BigDecimal totalValue = BigDecimal.ZERO;
    for (Map.Entry<Metal, BigDecimal> entry : ouncesByMetal.entrySet()) {
      BigDecimal price =
          marketPriceProvider.pricePerTroyOunce(entry.getKey(), asOf).orElse(BigDecimal.ZERO);
      BigDecimal metalValue = money(entry.getValue().multiply(price));
      valueByMetal.put(entry.getKey(), metalValue);
      totalValue = totalValue.add(metalValue);
    }
    totalValue = money(totalValue);

    BigDecimal gain = money(totalValue.subtract(costBasis));
    BigDecimal returnPercent =
        costBasis.signum() == 0
            ? BigDecimal.ZERO
            : percent(
                totalValue
                    .subtract(costBasis)
                    .divide(costBasis, 8, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")));

    Map<Metal, BigDecimal> allocation = new LinkedHashMap<>();
    for (Metal metal : Metal.values()) {
      BigDecimal metalValue = valueByMetal.get(metal);
      if (metalValue == null || metalValue.signum() == 0) {
        continue;
      }
      if (totalValue.signum() == 0) {
        allocation.put(metal, BigDecimal.ZERO.setScale(PERCENT_SCALE, RoundingMode.HALF_UP));
      } else {
        allocation.put(
            metal,
            percent(
                metalValue
                    .divide(totalValue, 8, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))));
      }
    }

    return new ValuationResult(totalValue, costBasis, gain, returnPercent, allocation);
  }

  public static BigDecimal toTroyOunces(Transaction transaction) {
    return toTroyOunces(transaction.getQuantity(), transaction.getUnit());
  }

  public static BigDecimal toTroyOunces(BigDecimal quantity, WeightUnit unit) {
    return switch (unit) {
      case TROY_OUNCE -> quantity.setScale(QTY_SCALE, RoundingMode.HALF_UP);
      case GRAM ->
          quantity.divide(WeightUnit.GRAMS_PER_TROY_OUNCE, QTY_SCALE, RoundingMode.HALF_UP);
    };
  }

  private static BigDecimal money(BigDecimal value) {
    return value.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
  }

  private static BigDecimal percent(BigDecimal value) {
    return value.setScale(PERCENT_SCALE, RoundingMode.HALF_UP);
  }
}
