package com.example.preciousmetals.auth.validation;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Documented
@Target({ FIELD, PARAMETER })
@Retention(RUNTIME)
@Constraint(validatedBy = {})
@NotBlank(message = "Password is required")
@Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
@Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
        message = "Password must contain at least one lowercase letter, one uppercase letter, and one number")
public @interface StrongPassword {

    String message() default "Password must contain at least one lowercase letter, one uppercase letter, and one number";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
