package com.example.preciousmetals.auth.controller;

import com.example.preciousmetals.auth.dto.CsrfResponse;
import com.example.preciousmetals.auth.dto.LoginRequest;
import com.example.preciousmetals.auth.dto.RegisterRequest;
import com.example.preciousmetals.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @GetMapping("/me")
  public ResponseEntity<?> me(Authentication auth) {
    return ResponseEntity.ok("OK");
  }

  @GetMapping("/csrf")
  public CsrfResponse csrf(CsrfToken csrfToken) {
    return new CsrfResponse(
        csrfToken.getHeaderName(), csrfToken.getParameterName(), csrfToken.getToken());
  }

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public void register(
      @Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest httpRequest) {
    Authentication authentication = this.authService.register(registerRequest);
    establishSession(authentication, httpRequest);
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(
      @Valid @RequestBody LoginRequest loginRequest, HttpServletRequest httpRequest) {
    Authentication authentication = this.authService.login(loginRequest);
    establishSession(authentication, httpRequest);
    return ResponseEntity.ok("Login Successful");
  }

  private void establishSession(Authentication authentication, HttpServletRequest httpRequest) {
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(authentication);
    SecurityContextHolder.setContext(context);
    HttpSession session = httpRequest.getSession(true);
    session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
  }
}
