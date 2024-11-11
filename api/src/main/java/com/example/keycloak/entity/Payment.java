package com.example.keycloak.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Payments")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long payment_id;

    String paymentMethod; // e.g., CREDIT_CARD, PAYPAL
    Double amount;
    String status; // e.g., PAID, PENDING, FAILED

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    Order order;
}
