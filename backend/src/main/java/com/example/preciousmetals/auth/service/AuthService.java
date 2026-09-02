package com.example.preciousmetals.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.preciousmetals.auth.dto.LoginRequest;
import com.example.preciousmetals.auth.dto.RegisterRequest;
import com.example.preciousmetals.auth.exception.EmailAlreadyRegisteredException;
import com.example.preciousmetals.auth.model.User;
import com.example.preciousmetals.auth.repository.UserRepository;

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

    public void register(RegisterRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new EmailAlreadyRegisteredException();
        }
        String hash = passwordEncoder.encode(req.getPassword());
        User user = new User(
                req.getEmail(),
                hash);
        userRepository.save(user);
    }

    public Authentication login(LoginRequest req) {
        return authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
    }

}
