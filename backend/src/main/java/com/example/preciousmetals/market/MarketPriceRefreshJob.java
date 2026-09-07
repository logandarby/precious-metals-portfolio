package com.example.preciousmetals.market;

import com.example.preciousmetals.market.model.MetalPrice;
import com.example.preciousmetals.market.repository.MetalPriceRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class MarketPriceRefreshJob {

  private static final Logger logger = LoggerFactory.getLogger(MarketPriceRefreshJob.class);
  private static final String CURRENCY = "CAD";

  private final ExternalMarketPriceClient marketPriceClient;
  private final MetalPriceRepository metalPriceRepository;

  public MarketPriceRefreshJob(
      ExternalMarketPriceClient marketPriceClient, MetalPriceRepository metalPriceRepository) {
    this.marketPriceClient = marketPriceClient;
    this.metalPriceRepository = metalPriceRepository;
  }

  @Scheduled(cron = "${app.market-price.refresh-cron}")
  @Transactional
  public void refreshPrices() {
    List<ExternalMarketPriceClient.MarketPriceQuote> prices = marketPriceClient.currentPrices(CURRENCY);

    prices.forEach(
        quote -> {
          MetalPrice record =
              MetalPrice.create(quote.metal(), quote.price(), CURRENCY, quote.timestamp());
          metalPriceRepository.save(record);
        });
    logger.info("Saved {} market prices at {}", prices.size(), prices.getFirst().timestamp());
  }
}
