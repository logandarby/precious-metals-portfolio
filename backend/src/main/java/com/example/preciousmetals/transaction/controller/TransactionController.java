package com.example.preciousmetals.transaction.controller;

import com.example.preciousmetals.auth.service.AuthService;
import com.example.preciousmetals.transaction.dto.CreateTransactionsRequest;
import com.example.preciousmetals.transaction.dto.TransactionResponse;
import com.example.preciousmetals.transaction.service.TransactionService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolios/{portfolioId}/transactions")
public class TransactionController {

  private final TransactionService transactionService;
  private final AuthService authService;

  public TransactionController(TransactionService transactionService, AuthService authService) {
    this.transactionService = transactionService;
    this.authService = authService;
  }

  @GetMapping
  public List<TransactionResponse> list(Authentication auth, @PathVariable UUID portfolioId) {
    return transactionService.listTransactions(authService.requireUser(auth), portfolioId);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public List<TransactionResponse> create(
      Authentication auth,
      @PathVariable UUID portfolioId,
      @Valid @RequestBody CreateTransactionsRequest request) {
    return transactionService.createTransactions(
        authService.requireUser(auth), portfolioId, request);
  }
}
