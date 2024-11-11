package com.example.keycloak.dto;

import com.example.keycloak.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private String productName;
    private String category;
    private String image;
    private Integer quantity;
    private Double price;

    public OrderItemDTO(String proName, Category category, String proImage, Integer quantity, Double price) {
        this.productName = proName;
        this.category = category != null ? category.getCate_name() : "Unknown";
        this.image = proImage;
        this.quantity = quantity;
        this.price = price;
    }
}
