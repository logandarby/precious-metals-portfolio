package com.example.preciousmetals.valuation;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.portfolio-valuation")
public record PortfolioValuationProperties(Duration cacheTtl, String cacheKeyPrefix) {}
