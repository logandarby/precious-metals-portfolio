package com.example.preciousmetals.transaction.model;

import com.example.preciousmetals.common.model.Metal;
import com.example.preciousmetals.common.model.WeightUnit;
import com.example.preciousmetals.portfolio.model.Portfolio;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "transactions")
@Getter
public class Transaction {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "portfolio_id", nullable = false)
  private Portfolio portfolio;

  @NotNull
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Metal metal;

  @NotNull
  @DecimalMin(value = "0", inclusive = false)
  @Digits(integer = 11, fraction = 8)
  @Column(nullable = false, precision = 19, scale = 8)
  private BigDecimal quantity;

  @NotNull
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private WeightUnit unit;

  @NotNull
  @DecimalMin(value = "0", inclusive = true)
  @Digits(integer = 15, fraction = 4)
  @Column(name = "purchase_price", nullable = false, precision = 19, scale = 4)
  private BigDecimal purchasePrice;

  @NotBlank
  @Size(min = 3, max = 3)
  @Column(nullable = false, length = 3)
  private String currency;

  @NotNull
  @Column(name = "transaction_date", nullable = false)
  private LocalDate transactionDate;

  @CreatedDate
  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  protected Transaction() {}

  public Transaction(
      Portfolio portfolio,
      Metal metal,
      BigDecimal quantity,
      WeightUnit unit,
      BigDecimal purchasePrice,
      LocalDate transactionDate) {
    this.portfolio = portfolio;
    this.metal = metal;
    this.quantity = quantity;
    this.unit = unit;
    this.purchasePrice = purchasePrice;
    this.currency = Portfolio.CAD;
    this.transactionDate = transactionDate;
  }
}
