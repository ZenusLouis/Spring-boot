package com.example.keycloak.dto;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class OrderDTO {
    Long orderId;
    Date orderDate;
    String status;
    Long userId;
    String firstName;
    String lastName;
    String address;
    String phone;
    List<OrderItemDTO> orderItems;
    Double totalPrice;

    public OrderDTO(Long orderId, Date orderDate, String status, Long userId, String firstName, String lastName, String address, String phone, List<OrderItemDTO> orderItems, double totalPrice) {
        this.orderId = orderId;
        this.orderDate = orderDate;
        this.status = status;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.address = address;
        this.phone = phone;
        this.orderItems = orderItems;
        this.totalPrice = totalPrice;
    }
}
