package com.example.preciousmetals.portfolio.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record HistoryPointResponse(OffsetDateTime date, BigDecimal value) {}
