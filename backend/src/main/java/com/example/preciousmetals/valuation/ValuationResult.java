package com.example.preciousmetals.valuation;

import com.example.preciousmetals.common.model.Metal;
import java.math.BigDecimal;
import java.util.Map;

public record ValuationResult(
    BigDecimal value,
    BigDecimal costBasis,
    BigDecimal gain,
    BigDecimal returnPercent,
    Map<Metal, BigDecimal> allocation) {}
