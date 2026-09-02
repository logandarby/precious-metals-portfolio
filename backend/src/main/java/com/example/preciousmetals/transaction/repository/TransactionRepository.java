package com.example.preciousmetals.transaction.repository;

import com.example.preciousmetals.portfolio.model.Portfolio;
import com.example.preciousmetals.transaction.model.Transaction;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
  List<Transaction> findAllByPortfolioOrderByTransactionDateAscCreatedAtAsc(Portfolio portfolio);

  void deleteAllByPortfolio(Portfolio portfolio);
}
