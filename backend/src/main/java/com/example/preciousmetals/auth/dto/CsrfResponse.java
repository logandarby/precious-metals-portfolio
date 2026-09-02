package com.example.preciousmetals.auth.dto;

public record CsrfResponse(String headerName, String parameterName, String token) {
}
