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
@Table(name = "Products")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long pro_id;

    String pro_name;
    String pro_des;
    String pro_image;
    Integer pro_stock;
    Double pro_price;
    Integer pro_status;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @ManyToOne
    @JoinColumn(name = "cate_id")
    Category category;

    // Automatically set creation date when the product is created
    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    // Automatically set updated date when the product is updated
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date(); // Update the date whenever product is updated
    }
}
