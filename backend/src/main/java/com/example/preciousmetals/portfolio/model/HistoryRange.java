package com.example.preciousmetals.portfolio.model;

import java.time.OffsetDateTime;
import java.time.Period;
import java.time.Duration;
import java.time.temporal.TemporalAmount;
import java.util.Arrays;

public enum HistoryRange {
  D1("1D", Duration.ofHours(1)),
  W1("1W", Period.ofDays(1)),
  M1("1M", Period.ofDays(1)),
  M3("3M", Period.ofWeeks(1)),
  Y1("1Y", Period.ofWeeks(1)),
  YTD("YTD", Period.ofWeeks(1)),
  ALL("ALL", Period.ofWeeks(1));

  private final String code;
  private final TemporalAmount step;

  HistoryRange(String code, TemporalAmount step) {
    this.code = code;
    this.step = step;
  }

  public String code() {
    return code;
  }

  public TemporalAmount step() {
    return step;
  }

  public OffsetDateTime startDate(OffsetDateTime end, OffsetDateTime firstPurchase) {
    OffsetDateTime rangeStart =
        switch (this) {
          case D1 -> end.minusDays(1);
          case W1 -> end.minusWeeks(1);
          case M1 -> end.minusMonths(1);
          case M3 -> end.minusMonths(3);
          case Y1 -> end.minusYears(1);
            case YTD ->
              end.withDayOfYear(1)
                .withMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);
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
