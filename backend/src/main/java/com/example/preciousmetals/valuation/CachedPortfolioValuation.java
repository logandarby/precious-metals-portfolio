package com.example.preciousmetals.valuation;

import java.time.OffsetDateTime;
import java.util.Optional;

public record CachedPortfolioValuation(
    ValuationResult valuation,
    OffsetDateTime valuedAt,
    Optional<OffsetDateTime> priceTimestamp) {}
