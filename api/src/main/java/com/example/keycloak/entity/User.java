package com.example.keycloak.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "users")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false, unique = true)
    String username;

    @Column(nullable = false)
    String password;

    @Column(unique = true)
    String email;

    @Column()
    String firstName;

    @Column()
    String lastName;

    @Column()
    String phone;

    @Column()
    String address;

    @Column()
    Double budget;

    // Relationship to represent the user's orders
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    List<Order> orders = new ArrayList<>();
}
