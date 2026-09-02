package com.example.preciousmetals.market;

import com.example.preciousmetals.common.model.Metal;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

public interface MarketPriceProvider {
  Optional<BigDecimal> pricePerTroyOunce(Metal metal, LocalDate date);
}
