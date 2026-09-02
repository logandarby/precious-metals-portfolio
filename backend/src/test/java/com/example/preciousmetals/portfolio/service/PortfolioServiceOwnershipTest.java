package com.example.preciousmetals.portfolio.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.example.preciousmetals.auth.model.User;
import com.example.preciousmetals.portfolio.exception.PortfolioNotFoundException;
import com.example.preciousmetals.portfolio.model.Portfolio;
import com.example.preciousmetals.portfolio.repository.PortfolioRepository;
import com.example.preciousmetals.transaction.repository.TransactionRepository;
import com.example.preciousmetals.valuation.ValuationService;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class PortfolioServiceOwnershipTest {

  @Test
  void requirePortfolioReturnsOwnedPortfolio() {
    User owner = new User("owner@example.com", "hash");
    UUID portfolioId = UUID.fromString("33333333-3333-3333-3333-333333333301");
    Portfolio portfolio = new Portfolio("Mine", owner);
    PortfolioRepository portfolioRepository = mock(PortfolioRepository.class);
    when(portfolioRepository.findByIdAndOwner(portfolioId, owner))
        .thenReturn(Optional.of(portfolio));

    PortfolioService service =
        new PortfolioService(
            portfolioRepository, mock(TransactionRepository.class), mock(ValuationService.class));

    assertThat(service.requirePortfolio(owner, portfolioId)).isSameAs(portfolio);
  }

  @Test
  void requirePortfolioHidesOtherUsersPortfolios() {
    User otherUser = new User("other@example.com", "hash");
    UUID portfolioId = UUID.fromString("33333333-3333-3333-3333-333333333301");
    PortfolioRepository portfolioRepository = mock(PortfolioRepository.class);
    when(portfolioRepository.findByIdAndOwner(portfolioId, otherUser)).thenReturn(Optional.empty());

    PortfolioService service =
        new PortfolioService(
            portfolioRepository, mock(TransactionRepository.class), mock(ValuationService.class));

    assertThatThrownBy(() -> service.requirePortfolio(otherUser, portfolioId))
        .isInstanceOf(PortfolioNotFoundException.class);
  }
}
