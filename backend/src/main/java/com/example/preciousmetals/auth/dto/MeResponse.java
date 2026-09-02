package com.example.preciousmetals.auth.dto;

import com.example.preciousmetals.auth.model.User;
import java.util.UUID;

public record MeResponse(UUID id, String email) {

  public static MeResponse from(User user) {
    return new MeResponse(user.getId(), user.getEmail());
  }
}
