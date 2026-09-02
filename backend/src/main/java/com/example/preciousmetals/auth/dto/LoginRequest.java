package com.example.preciousmetals.auth.dto;

import com.example.preciousmetals.auth.validation.RegisterEmail;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LoginRequest {
    @RegisterEmail
    private String email;

    @NotBlank(message = "Password is required")
    @Size(max = 72, message = "Password is too long")
    private String password;

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
