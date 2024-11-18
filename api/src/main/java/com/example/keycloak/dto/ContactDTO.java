package com.example.keycloak.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContactDTO {
    Long id;
    String message;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    Long userId;
    String userEmail;
    String username;
    String firstName;
    String lastName;
}
