package com.example.preciousmetals.auth.service;

import com.example.preciousmetals.auth.dto.LoginRequest;
import com.example.preciousmetals.auth.dto.MeResponse;
import com.example.preciousmetals.auth.dto.RegisterRequest;
import com.example.preciousmetals.auth.exception.EmailAlreadyRegisteredException;
import com.example.preciousmetals.auth.model.User;
import com.example.preciousmetals.auth.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;

  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      AuthenticationManager authenticationManager) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
  }

  @Transactional
  public Authentication register(RegisterRequest req) {
    if (userRepository.findByEmail(req.email()).isPresent()) {
      throw new EmailAlreadyRegisteredException();
    }
    String hash = passwordEncoder.encode(req.password());
    User user = new User(req.email(), hash);
    userRepository.save(user);
    return login(new LoginRequest(req.email(), req.password()));
  }

  public Authentication login(LoginRequest req) {
    return authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.email(), req.password()));
  }

  public MeResponse currentUser(Authentication authentication) {
    return userRepository
        .findByEmail(authentication.getName())
        .map(MeResponse::from)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
  }
}
