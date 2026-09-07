package com.example.preciousmetals.valuation;

import java.util.Optional;
import java.util.UUID;

public interface PortfolioValuationCache {
  Optional<CachedPortfolioValuation> get(UUID portfolioId);

  void put(UUID portfolioId, CachedPortfolioValuation valuation);

  void evict(UUID portfolioId);
}
