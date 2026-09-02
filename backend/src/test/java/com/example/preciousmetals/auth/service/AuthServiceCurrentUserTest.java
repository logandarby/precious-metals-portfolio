package com.example.preciousmetals.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.example.preciousmetals.auth.dto.MeResponse;
import com.example.preciousmetals.auth.model.User;
import com.example.preciousmetals.auth.repository.UserRepository;
import java.lang.reflect.Field;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

class AuthServiceCurrentUserTest {

  @Test
  void currentUserReturnsIdAndEmail() throws Exception {
    UUID id = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    User user = userWithId(id, "owner@example.com");
    UserRepository userRepository = mock(UserRepository.class);
    when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(user));

    AuthService service =
        new AuthService(
            userRepository, mock(PasswordEncoder.class), mock(AuthenticationManager.class));
    Authentication authentication = mock(Authentication.class);
    when(authentication.getName()).thenReturn("owner@example.com");

    MeResponse response = service.currentUser(authentication);

    assertThat(response.id()).isEqualTo(id);
    assertThat(response.email()).isEqualTo("owner@example.com");
  }

  @Test
  void currentUserThrowsWhenUserDoesNotExist() {
    UserRepository userRepository = mock(UserRepository.class);
    when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

    AuthService service =
        new AuthService(
            userRepository, mock(PasswordEncoder.class), mock(AuthenticationManager.class));
    Authentication authentication = mock(Authentication.class);
    when(authentication.getName()).thenReturn("missing@example.com");

    assertThatThrownBy(() -> service.currentUser(authentication))
        .isInstanceOf(UsernameNotFoundException.class);
  }

  private static User userWithId(UUID id, String email) throws Exception {
    User user = new User(email, "hash");
    Field idField = User.class.getDeclaredField("id");
    idField.setAccessible(true);
    idField.set(user, id);
    return user;
  }
}
