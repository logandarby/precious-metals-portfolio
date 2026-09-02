package com.example.preciousmetals.portfolio.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public record PortfolioListResponse(
    BigDecimal totalValue, String currency, List<PortfolioResponse> portfolios) {

  public static PortfolioListResponse from(List<PortfolioResponse> portfolios) {
    BigDecimal totalValue =
        portfolios.stream()
            .map(PortfolioResponse::value)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .setScale(2, RoundingMode.HALF_UP);
    return new PortfolioListResponse(totalValue, "CAD", portfolios);
  }
}
