package com.example.preciousmetals.valuation;

import static java.util.Objects.requireNonNull;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.stereotype.Service;

@Service
public class RedisPortfolioValuationCache implements PortfolioValuationCache {

  private static final Logger log = LoggerFactory.getLogger(RedisPortfolioValuationCache.class);

  private final RedisTemplate<String, CachedPortfolioValuation> redisTemplate;
  private final PortfolioValuationProperties properties;

  public RedisPortfolioValuationCache(
      RedisTemplate<String, CachedPortfolioValuation> redisTemplate,
      PortfolioValuationProperties properties) {
    this.redisTemplate = requireNonNull(redisTemplate);
    this.properties = requireNonNull(properties);
  }

  @Override
  public Optional<CachedPortfolioValuation> get(UUID portfolioId) {
    String key = keyFor(portfolioId);
    try {
      CachedPortfolioValuation cached = redisTemplate.opsForValue().get(key);
      log.info("Portfolio valuation cache {} for key {}", cached == null ? "MISS" : "HIT", key);
      return Optional.ofNullable(cached);
    } catch (RuntimeException e) {
      log.warn("Portfolio valuation cache read failed for portfolio {}", portfolioId, e);
      return Optional.empty();
    }
  }

  @Override
  public void put(UUID portfolioId, CachedPortfolioValuation valuation) {
    String key = keyFor(portfolioId);
    try {
      redisTemplate.opsForValue().set(key, valuation, properties.cacheTtl());
      log.info("Portfolio valuation cache PUT for key {} with TTL {}", key, properties.cacheTtl());
    } catch (RuntimeException e) {
      log.warn("Portfolio valuation cache write failed for portfolio {}", portfolioId, e);
    }
  }

  @Override
  public void evict(UUID portfolioId) {
    String key = keyFor(portfolioId);
    try {
      Boolean deleted = redisTemplate.delete(key);
      log.info("Portfolio valuation cache EVICT for key {} (deleted={})", key, deleted);
    } catch (RuntimeException e) {
      log.warn("Portfolio valuation cache eviction failed for portfolio {}", portfolioId, e);
    }
  }

  private String keyFor(UUID portfolioId) {
    return properties.cacheKeyPrefix() + ":" + portfolioId;
  }

  @Configuration
  static class RedisConfiguration {

    @Bean
    RedisTemplate<String, CachedPortfolioValuation> portfolioValuationRedisTemplate(
        RedisConnectionFactory connectionFactory) {
      ObjectMapper mapper = new ObjectMapper();
      mapper.registerModule(new JavaTimeModule());
      mapper.registerModule(new Jdk8Module());
      mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

      Jackson2JsonRedisSerializer<CachedPortfolioValuation> serializer =
          new Jackson2JsonRedisSerializer<>(CachedPortfolioValuation.class);
      serializer.setObjectMapper(mapper);

      RedisTemplate<String, CachedPortfolioValuation> template = new RedisTemplate<>();
      template.setConnectionFactory(connectionFactory);
      template.setKeySerializer(new StringRedisSerializer());
      template.setValueSerializer(serializer);
      template.setHashKeySerializer(new StringRedisSerializer());
      template.setHashValueSerializer(serializer);
      template.afterPropertiesSet();
      return template;
    }
  }
}
