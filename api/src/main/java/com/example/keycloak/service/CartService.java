package com.example.keycloak.service;

import com.example.keycloak.dto.CartItem;
import com.example.keycloak.entity.Product;
import com.example.keycloak.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    @Autowired
    private ProductRepository productRepository;

    public boolean validateCart(List<CartItem> cartItems) {
        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProductId()).orElse(null);
            if (product == null) {
                return false;
            }
            if (product.getPro_stock() < cartItem.getQuantity()) {
                return false;
            }
        }
        return true;
    }

    public double calculateTotalPrice(List<CartItem> cartItems) {
        double total = 0;
        for (CartItem cartItem : cartItems) {
            total += cartItem.getPrice() * cartItem.getQuantity();
        }
        return total;
    }

    public void updateProductStockAfterCheckout(List<CartItem> cartItems) {
        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProductId()).orElse(null);
            if (product != null) {
                product.setPro_stock(product.getPro_stock() - cartItem.getQuantity());
                productRepository.save(product);
            }
        }
    }
}
