package com.example.keycloak.dto;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItem implements Serializable {
    private static final long serialVersionUID = 1L;

    Long productId;
    int quantity;
    Double price;

    public CartItem(Long productId, int quantity, Double price) {
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
    }
}
