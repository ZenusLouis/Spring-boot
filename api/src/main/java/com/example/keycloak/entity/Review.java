package com.example.keycloak.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Reviews")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long review_id;

    String content;
    Integer rating; // Rating out of 5

    @Temporal(TemporalType.TIMESTAMP)
    Date createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne
    @JoinColumn(name = "pro_id", nullable = false)
    Product product;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
    }
}
