package com.example.preciousmetals.portfolio.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record HistoryPointResponse(LocalDate date, BigDecimal value) {}
