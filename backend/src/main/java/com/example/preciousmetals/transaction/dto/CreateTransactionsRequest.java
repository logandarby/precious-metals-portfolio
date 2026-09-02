package com.example.preciousmetals.transaction.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CreateTransactionsRequest(
    @NotEmpty(message = "At least one transaction is required") @Valid
        List<CreateTransactionRequest> transactions) {}
