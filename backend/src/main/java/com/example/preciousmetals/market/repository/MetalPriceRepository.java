package com.example.preciousmetals.market.repository;

import com.example.preciousmetals.common.model.Metal;
import com.example.preciousmetals.market.model.MetalPrice;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MetalPriceRepository extends JpaRepository<MetalPrice, UUID> {
  Optional<MetalPrice> findFirstByMetalAndCurrencyAndPriceDateLessThanEqualOrderByPriceDateDesc(
      Metal metal, String currency, OffsetDateTime priceDate);
}
