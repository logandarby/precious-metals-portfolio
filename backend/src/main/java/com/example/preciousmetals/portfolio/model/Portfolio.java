package com.example.preciousmetals.portfolio.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "portfolios")
@Getter
public class Portfolio {

  public static final String CAD = "CAD";

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @NotBlank
  @Size(max = 255)
  @Column(nullable = false)
  private String name;

  @NotBlank
  @Size(min = 3, max = 3)
  @Column(name = "base_currency", nullable = false, length = 3)
  private String baseCurrency;

  @CreatedDate
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  protected Portfolio() {}

  public Portfolio(String name) {
    this.name = name;
    this.baseCurrency = CAD;
  }

  public void rename(String name) {
    this.name = name;
  }
}
