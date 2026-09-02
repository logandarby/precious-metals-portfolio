package com.example.preciousmetals.auth.dto;

import com.example.preciousmetals.auth.validation.RegisterEmail;
import com.example.preciousmetals.auth.validation.StrongPassword;

public record RegisterRequest(@RegisterEmail String email, @StrongPassword String password) {}
