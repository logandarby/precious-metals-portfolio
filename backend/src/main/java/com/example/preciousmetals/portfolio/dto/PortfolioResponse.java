package com.example.preciousmetals.portfolio.dto;

import com.example.preciousmetals.common.model.Metal;
import com.example.preciousmetals.portfolio.model.Portfolio;
import com.example.preciousmetals.valuation.ValuationResult;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record PortfolioResponse(
    UUID id,
    String name,
    String currency,
    BigDecimal value,
    BigDecimal costBasis,
    BigDecimal gain,
    BigDecimal returnPercent,
    Map<Metal, BigDecimal> allocation,
    OffsetDateTime valuedAt) {

  public static PortfolioResponse from(Portfolio portfolio, ValuationResult valuation) {
    return new PortfolioResponse(
        portfolio.getId(),
        portfolio.getName(),
        portfolio.getBaseCurrency(),
        valuation.value(),
        valuation.costBasis(),
        valuation.gain(),
        valuation.returnPercent(),
        valuation.allocation(),
        valuation.valuedAt() != null ? valuation.valuedAt() : OffsetDateTime.now());
  }
}
