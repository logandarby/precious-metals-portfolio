package com.example.preciousmetals.auth.dto;

import com.example.preciousmetals.auth.validation.RegisterEmail;
import com.example.preciousmetals.auth.validation.StrongPassword;

public class RegisterRequest {
    @RegisterEmail
    private String email;

    @StrongPassword
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
