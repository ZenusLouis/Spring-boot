package com.example.keycloak.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "OrderItems")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long orderItem_id;

    Integer quantity;
    Double price;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonBackReference
    Order order;

    @ManyToOne
    @JoinColumn(name = "pro_id")
    Product product;
}
