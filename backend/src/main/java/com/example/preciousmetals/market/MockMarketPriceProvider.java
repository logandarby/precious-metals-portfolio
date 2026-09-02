package com.example.preciousmetals.market;

import com.example.preciousmetals.common.model.Metal;
import com.example.preciousmetals.market.repository.MetalPriceRepository;
import com.example.preciousmetals.portfolio.model.Portfolio;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class MockMarketPriceProvider implements MarketPriceProvider {

  private final MetalPriceRepository metalPriceRepository;

  public MockMarketPriceProvider(MetalPriceRepository metalPriceRepository) {
    this.metalPriceRepository = metalPriceRepository;
  }

  @Override
  public Optional<BigDecimal> pricePerTroyOunce(Metal metal, LocalDate date) {
    return metalPriceRepository
        .findFirstByMetalAndCurrencyAndPriceDateLessThanEqualOrderByPriceDateDesc(
            metal, Portfolio.CAD, date)
        .map(price -> price.getPrice());
  }
}
