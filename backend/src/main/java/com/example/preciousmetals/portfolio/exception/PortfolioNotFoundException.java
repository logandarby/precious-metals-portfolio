package com.example.preciousmetals.portfolio.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

public class PortfolioNotFoundException extends ErrorResponseException {

  public PortfolioNotFoundException() {
    super(HttpStatus.NOT_FOUND, problemDetail(), null);
  }

  private static ProblemDetail problemDetail() {
    ProblemDetail problem =
        ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Portfolio could not be found.");
    problem.setProperty("code", "PORTFOLIO_NOT_FOUND");
    return problem;
  }
}
