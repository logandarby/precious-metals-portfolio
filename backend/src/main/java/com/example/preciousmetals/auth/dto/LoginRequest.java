package com.example.preciousmetals.auth.dto;

import com.example.preciousmetals.auth.validation.RegisterEmail;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
    @RegisterEmail String email,
    @NotBlank(message = "Password is required") @Size(max = 72, message = "Password is too long")
        String password) {}
