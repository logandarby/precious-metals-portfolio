package com.example.preciousmetals.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePortfolioRequest(@NotBlank @Size(max = 255) String name) {}
