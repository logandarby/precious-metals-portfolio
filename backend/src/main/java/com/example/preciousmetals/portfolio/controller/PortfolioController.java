package com.example.preciousmetals.portfolio.controller;

import com.example.preciousmetals.portfolio.dto.CreatePortfolioRequest;
import com.example.preciousmetals.portfolio.dto.UpdatePortfolioRequest;
import com.example.preciousmetals.portfolio.dto.HistoryPointResponse;
import com.example.preciousmetals.portfolio.dto.PortfolioListResponse;
import com.example.preciousmetals.portfolio.dto.PortfolioResponse;
import com.example.preciousmetals.portfolio.model.HistoryRange;
import com.example.preciousmetals.portfolio.service.PortfolioService;
import com.example.preciousmetals.valuation.ValuationResult;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
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

  public PortfolioController(PortfolioService portfolioService) {
    this.portfolioService = portfolioService;
  }

  @GetMapping
  public PortfolioListResponse list() {
    return portfolioService.listPortfolios();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public PortfolioResponse create(@Valid @RequestBody CreatePortfolioRequest request) {
    return portfolioService.createPortfolio(request);
  }

  @GetMapping("/{id}")
  public PortfolioResponse get(@PathVariable UUID id) {
    return portfolioService.getPortfolio(id);
  }

  @PatchMapping("/{id}")
  public PortfolioResponse rename(
      @PathVariable UUID id, @Valid @RequestBody UpdatePortfolioRequest request) {
    return portfolioService.renamePortfolio(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable UUID id) {
    portfolioService.deletePortfolio(id);
  }

  @GetMapping("/{id}/value")
  public ValuationResult value(@PathVariable UUID id) {
    return portfolioService.getValue(id);
  }

  @GetMapping("/{id}/history")
  public List<HistoryPointResponse> history(
      @PathVariable UUID id, @RequestParam(defaultValue = "ALL") String range) {
    return portfolioService.getHistory(id, HistoryRange.fromCode(range));
  }
}
