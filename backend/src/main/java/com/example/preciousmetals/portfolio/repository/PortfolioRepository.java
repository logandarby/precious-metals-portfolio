package com.example.preciousmetals.portfolio.repository;

import com.example.preciousmetals.auth.model.User;
import com.example.preciousmetals.portfolio.model.Portfolio;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {
  List<Portfolio> findAllByOwnerOrderByCreatedAtAsc(User owner);

  Optional<Portfolio> findByIdAndOwner(UUID id, User owner);
}
