package com.example.preciousmetals.market;

import com.example.preciousmetals.common.model.Metal;
import com.example.preciousmetals.market.repository.MetalPriceRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class MockMarketPriceProvider implements MarketPriceProvider {

	private static final String CURRENCY = "CAD";

	private final MetalPriceRepository metalPriceRepository;

	public MockMarketPriceProvider(MetalPriceRepository metalPriceRepository) {
		this.metalPriceRepository = metalPriceRepository;
	}

	@Override
	public Optional<BigDecimal> pricePerTroyOunce(Metal metal, OffsetDateTime asOf) {
		return metalPriceRepository
				.findFirstByMetalAndCurrencyAndPriceDateLessThanEqualOrderByPriceDateDesc(
						metal, CURRENCY, asOf)
				.map(price -> price.getPrice());
	}
}
