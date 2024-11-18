package com.example.keycloak.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "orders")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long order_id;

    @Temporal(TemporalType.TIMESTAMP)
    Date orderDate;

    String status; // e.g., PENDING, SHIPPING, DELIVERED, CANCELLED

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    List<OrderItem> orderItems = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.orderDate = new Date();
    }
}
