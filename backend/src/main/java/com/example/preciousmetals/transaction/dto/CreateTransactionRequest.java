package com.example.preciousmetals.transaction.dto;

import com.example.preciousmetals.common.model.Metal;
import com.example.preciousmetals.common.model.WeightUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CreateTransactionRequest(
    @NotNull(message = "Metal is required") Metal metal,
    @NotNull(message = "Quantity is required")
        @DecimalMin(value = "0", inclusive = false, message = "Quantity must be greater than 0")
        @Digits(integer = 11, fraction = 8)
        BigDecimal quantity,
    @NotNull(message = "Unit is required") WeightUnit unit,
    @NotNull(message = "Purchase price is required")
        @DecimalMin(value = "0", inclusive = true, message = "Purchase price cannot be negative")
        @Digits(integer = 15, fraction = 4)
        BigDecimal purchasePrice,
    @NotNull(message = "Transaction date is required") OffsetDateTime transactionDate) {}
