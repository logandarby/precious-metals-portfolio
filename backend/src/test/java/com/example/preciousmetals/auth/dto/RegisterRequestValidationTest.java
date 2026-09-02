package com.example.preciousmetals.auth.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class RegisterRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void acceptsValidEmailAndPassword() {
        assertThat(validate("owner@example.com", "ValidPass1")).isEmpty();
    }

    @Test
    void rejectsBlankEmail() {
        Set<ConstraintViolation<RegisterRequest>> violations = validate("  ", "ValidPass1");

        assertThat(violations)
                .anyMatch(violation -> "email".equals(violation.getPropertyPath().toString())
                        && "Email is required".equals(violation.getMessage()));
    }

    @Test
    void rejectsInvalidEmail() {
        Set<ConstraintViolation<RegisterRequest>> violations = validate("not-an-email", "ValidPass1");

        assertThat(violations)
                .anyMatch(violation -> "email".equals(violation.getPropertyPath().toString())
                        && "Email must be a valid email address".equals(violation.getMessage()));
    }

    @Test
    void rejectsShortPassword() {
        Set<ConstraintViolation<RegisterRequest>> violations = validate("owner@example.com", "Ab1");

        assertThat(violations)
                .anyMatch(violation -> "password".equals(violation.getPropertyPath().toString())
                        && "Password must be between 8 and 72 characters".equals(violation.getMessage()));
    }

    @Test
    void rejectsPasswordWithoutRequiredCharacterClasses() {
        Set<ConstraintViolation<RegisterRequest>> violations = validate("owner@example.com", "alllowercase1");

        assertThat(violations)
                .anyMatch(violation -> "password".equals(violation.getPropertyPath().toString())
                        && "Password must contain at least one lowercase letter, one uppercase letter, and one number"
                                .equals(violation.getMessage()));
    }

    private static Set<ConstraintViolation<RegisterRequest>> validate(String email, String password) {
        RegisterRequest request = new RegisterRequest();
        request.setEmail(email);
        request.setPassword(password);
        return validator.validate(request);
    }
}
