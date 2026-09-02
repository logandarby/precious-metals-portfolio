package com.example.preciousmetals.auth.exception;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

public class EmailAlreadyRegisteredException extends ErrorResponseException {

  public EmailAlreadyRegisteredException() {
    super(HttpStatus.CONFLICT, problemDetail(), null);
  }

  private static ProblemDetail problemDetail() {
    ProblemDetail problem =
        ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Email is already registered");
    problem.setProperty("fieldErrors", Map.of("email", "Email is already registered"));
    return problem;
  }
}
