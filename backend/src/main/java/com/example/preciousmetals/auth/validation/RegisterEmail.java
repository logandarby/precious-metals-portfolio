package com.example.preciousmetals.auth.validation;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

@Documented
@Target({FIELD, PARAMETER})
@Retention(RUNTIME)
@Constraint(validatedBy = {})
@NotBlank(message = "Email is required")
@Size(max = 254, message = "Email must be at most 254 characters")
@Email(message = "Email must be a valid email address")
public @interface RegisterEmail {

  String message() default "Email must be a valid email address";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
