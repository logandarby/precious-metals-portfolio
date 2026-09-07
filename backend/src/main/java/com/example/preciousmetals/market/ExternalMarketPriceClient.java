package com.example.preciousmetals.market;

import com.example.preciousmetals.common.model.Metal;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class ExternalMarketPriceClient {

  private final RestTemplate restTemplate;
  private final String apiUrl;

  public ExternalMarketPriceClient(@Value("${app.market-price.api-url}") String apiUrl) {
    this.restTemplate = new RestTemplate();
    this.apiUrl = apiUrl;
  }

  public List<MarketPriceQuote> currentPrices(String currency) {
    String url = apiUrl + "/prices?currency=" + currency;
    MarketPriceResponse response = restTemplate.getForObject(url, MarketPriceResponse.class);

    if (response == null || response.prices() == null) {
      throw new IllegalStateException("Market price API returned no prices");
    }

    return response.prices();
  }

  public record MarketPriceResponse(String currency, OffsetDateTime generatedAt, List<MarketPriceQuote> prices) {}

  public record MarketPriceQuote(Metal metal, BigDecimal price, OffsetDateTime timestamp) {}
}
