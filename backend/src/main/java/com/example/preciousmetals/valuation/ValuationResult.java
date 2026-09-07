package com.example.preciousmetals.valuation;

import com.example.preciousmetals.common.model.Metal;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

public record ValuationResult(
    BigDecimal value,
    BigDecimal costBasis,
    BigDecimal gain,
    BigDecimal returnPercent,
    Map<Metal, BigDecimal> allocation,
    OffsetDateTime valuedAt) {

  public ValuationResult(
      BigDecimal value,
      BigDecimal costBasis,
      BigDecimal gain,
      BigDecimal returnPercent,
      Map<Metal, BigDecimal> allocation) {
    this(value, costBasis, gain, returnPercent, allocation, null);
  }
}
