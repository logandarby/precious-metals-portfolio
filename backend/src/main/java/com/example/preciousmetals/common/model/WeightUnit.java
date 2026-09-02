package com.example.preciousmetals.common.model;

import java.math.BigDecimal;

public enum WeightUnit {
  TROY_OUNCE,
  GRAM;

  public static final BigDecimal GRAMS_PER_TROY_OUNCE = new BigDecimal("31.1034768");
}
