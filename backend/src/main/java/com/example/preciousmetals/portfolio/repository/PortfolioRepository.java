package com.example.preciousmetals.portfolio.repository;

import com.example.preciousmetals.portfolio.model.Portfolio;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {
  List<Portfolio> findAllByOrderByCreatedAtAsc();
}
