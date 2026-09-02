package com.example.preciousmetals.market.model;

import com.example.preciousmetals.common.model.Metal;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;

@Entity
@Table(name = "metal_prices")
@Getter
public class MetalPrice {

  @Id private UUID id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Metal metal;

  @Column(nullable = false, precision = 19, scale = 4)
  private BigDecimal price;

  @Column(nullable = false, length = 3)
  private String currency;

  @Column(name = "price_date", nullable = false)
  private LocalDate priceDate;

  protected MetalPrice() {}
}
