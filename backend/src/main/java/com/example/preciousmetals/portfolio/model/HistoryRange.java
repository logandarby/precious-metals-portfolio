package com.example.preciousmetals.portfolio.model;

import java.time.LocalDate;
import java.time.Period;
import java.util.Arrays;

public enum HistoryRange {
  W1("1W", Period.ofDays(1)),
  M1("1M", Period.ofDays(1)),
  M3("3M", Period.ofWeeks(1)),
  Y1("1Y", Period.ofWeeks(1)),
  YTD("YTD", Period.ofWeeks(1)),
  ALL("ALL", Period.ofWeeks(1));

  private final String code;
  private final Period step;

  HistoryRange(String code, Period step) {
    this.code = code;
    this.step = step;
  }

  public String code() {
    return code;
  }

  public Period step() {
    return step;
  }

  public LocalDate startDate(LocalDate end, LocalDate firstPurchase) {
    LocalDate rangeStart =
        switch (this) {
          case W1 -> end.minusWeeks(1);
          case M1 -> end.minusMonths(1);
          case M3 -> end.minusMonths(3);
          case Y1 -> end.minusYears(1);
          case YTD -> LocalDate.of(end.getYear(), 1, 1);
          case ALL -> firstPurchase;
        };
    return firstPurchase.isAfter(rangeStart) ? firstPurchase : rangeStart;
  }

  public static HistoryRange fromCode(String code) {
    if (code == null || code.isBlank()) {
      return ALL;
    }
    return Arrays.stream(values())
        .filter(range -> range.code.equalsIgnoreCase(code.trim()))
        .findFirst()
        .orElse(ALL);
  }
}
