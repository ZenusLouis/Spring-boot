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
    String customerUsername;
    String customerPhone;
    String customerAddress;
    List<OrderItemDTO> orderItems;
    Double totalPrice;

    public OrderDTO(Long orderId, Date orderDate, String status, String username, String phone, String address, List<OrderItemDTO> orderItems, double totalPrice) {
        this.orderId = orderId;
        this.orderDate = orderDate;
        this.status = status;
        this.customerUsername = username;
        this.customerPhone = phone;
        this.customerAddress = address;
        this.orderItems = orderItems;
        this.totalPrice = totalPrice;
    }
}
