package com.example.preciousmetals.transaction.dto;

import com.example.preciousmetals.common.model.Metal;
import com.example.preciousmetals.common.model.WeightUnit;
import com.example.preciousmetals.transaction.model.Transaction;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record TransactionResponse(
    UUID id,
    UUID portfolioId,
    Metal metal,
    BigDecimal quantity,
    WeightUnit unit,
    BigDecimal purchasePrice,
    String currency,
    OffsetDateTime transactionDate) {

  public static TransactionResponse from(Transaction transaction) {
    return new TransactionResponse(
        transaction.getId(),
        transaction.getPortfolio().getId(),
        transaction.getMetal(),
        transaction.getQuantity(),
        transaction.getUnit(),
        transaction.getPurchasePrice(),
        transaction.getCurrency(),
        transaction.getTransactionDate());
  }
}
