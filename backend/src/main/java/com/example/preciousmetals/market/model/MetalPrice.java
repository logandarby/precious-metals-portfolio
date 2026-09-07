package com.example.preciousmetals.market.model;

import com.example.preciousmetals.common.model.Metal;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Getter;

@Entity
@Table(name = "metal_prices")
@Getter
public class MetalPrice {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Metal metal;

  @Column(nullable = false, precision = 19, scale = 4)
  private BigDecimal price;

  @Column(nullable = false, length = 3)
  private String currency;

  @Column(name = "price_date", nullable = false)
  private OffsetDateTime priceDate;

  protected MetalPrice() {}

  public static MetalPrice create(
      Metal metal, BigDecimal price, String currency, OffsetDateTime priceDate) {
    MetalPrice metalPrice = new MetalPrice();
    metalPrice.metal = metal;
    metalPrice.price = price;
    metalPrice.currency = currency;
    metalPrice.priceDate = priceDate;
    return metalPrice;
  }
}
