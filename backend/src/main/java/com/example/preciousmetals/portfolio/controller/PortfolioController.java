package com.example.preciousmetals.portfolio.controller;

import com.example.preciousmetals.auth.model.User;
import com.example.preciousmetals.auth.service.AuthService;
import com.example.preciousmetals.portfolio.dto.CreatePortfolioRequest;
import com.example.preciousmetals.portfolio.dto.HistoryPointResponse;
import com.example.preciousmetals.portfolio.dto.PortfolioListResponse;
import com.example.preciousmetals.portfolio.dto.PortfolioResponse;
import com.example.preciousmetals.portfolio.dto.UpdatePortfolioRequest;
import com.example.preciousmetals.portfolio.model.HistoryRange;
import com.example.preciousmetals.portfolio.service.PortfolioService;
import com.example.preciousmetals.valuation.ValuationResult;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolios")
public class PortfolioController {

  private final PortfolioService portfolioService;
  private final AuthService authService;

  public PortfolioController(PortfolioService portfolioService, AuthService authService) {
    this.portfolioService = portfolioService;
    this.authService = authService;
  }

  @GetMapping
  public PortfolioListResponse list(Authentication auth) {
    return portfolioService.listPortfolios(currentUser(auth));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public PortfolioResponse create(
      Authentication auth, @Valid @RequestBody CreatePortfolioRequest request) {
    return portfolioService.createPortfolio(currentUser(auth), request);
  }

  @GetMapping("/{id}")
  public PortfolioResponse get(Authentication auth, @PathVariable UUID id) {
    return portfolioService.getPortfolio(currentUser(auth), id);
  }

  @PatchMapping("/{id}")
  public PortfolioResponse rename(
      Authentication auth,
      @PathVariable UUID id,
      @Valid @RequestBody UpdatePortfolioRequest request) {
    return portfolioService.renamePortfolio(currentUser(auth), id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(Authentication auth, @PathVariable UUID id) {
    portfolioService.deletePortfolio(currentUser(auth), id);
  }

  @GetMapping("/{id}/value")
  public ValuationResult value(Authentication auth, @PathVariable UUID id) {
    return portfolioService.getValue(currentUser(auth), id);
  }

  @GetMapping("/{id}/history")
  public List<HistoryPointResponse> history(
      Authentication auth,
      @PathVariable UUID id,
      @RequestParam(defaultValue = "ALL") String range) {
    return portfolioService.getHistory(currentUser(auth), id, HistoryRange.fromCode(range));
  }

  private User currentUser(Authentication auth) {
    return authService.requireUser(auth);
  }
}
