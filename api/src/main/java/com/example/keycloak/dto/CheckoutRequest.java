package com.example.keycloak.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckoutRequest {
    private Long userId;
    private String phone;
    private String address;
}
