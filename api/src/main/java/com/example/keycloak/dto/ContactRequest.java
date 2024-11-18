package com.example.keycloak.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ContactRequest {
    String email;
    String message;
}
