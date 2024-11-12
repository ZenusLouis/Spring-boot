package com.example.keycloak.service;

import com.example.keycloak.dto.CartItem;
import com.example.keycloak.dto.OrderDTO;
import com.example.keycloak.dto.OrderItemDTO;
import com.example.keycloak.entity.Order;
import com.example.keycloak.entity.OrderItem;
import com.example.keycloak.entity.Product;
import com.example.keycloak.entity.User;
import com.example.keycloak.repository.OrderRepository;
import com.example.keycloak.repository.OrderItemRepository;
import com.example.keycloak.repository.ProductRepository;
import com.example.keycloak.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.camunda.bpm.engine.RuntimeService;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RuntimeService runtimeService;

    public List<OrderDTO> getUserOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        return orders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public boolean processOrder(Long userId, List<CartItem> cartItems) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Create a new order with status "PENDING"
            Order order = new Order();
            order.setUser(user);
            order.setStatus("PENDING");
            order = orderRepository.save(order);

            // Create order items from cart items
            for (CartItem cartItem : cartItems) {
                Product product = productRepository.findById(cartItem.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Product not found"));

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(product);
                orderItem.setQuantity(cartItem.getQuantity());
                orderItem.setPrice(product.getPro_price());
                orderItemRepository.save(orderItem);
            }

            // Calculate total order amount
            BigDecimal orderAmount = cartItems.stream()
                    .map(cartItem -> {
                        Product product = productRepository.findById(cartItem.getProductId())
                                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
                        BigDecimal price = BigDecimal.valueOf(product.getPro_price());
                        BigDecimal quantity = BigDecimal.valueOf(cartItem.getQuantity());
                        return price.multiply(quantity);
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<OrderDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return convertToDTO(order);
    }

    private OrderDTO convertToDTO(Order order) {
        List<OrderItemDTO> orderItems = order.getOrderItems().stream().map(item -> {
            Product product = item.getProduct();
            String categoryName = product.getCategory() != null ? product.getCategory().getCate_name() : "Unknown";

            // Handle null price by using a default value
            Double itemPrice = item.getPrice() != null ? item.getPrice() : 0.0;

            return new OrderItemDTO(
                    product.getPro_name(),
                    categoryName, // Category name from the Category entity
                    product.getPro_image(),  // Image URL or path
                    item.getQuantity(),
                    itemPrice
            );
        }).collect(Collectors.toList());

        // Calculate total price, considering null prices as 0.0
        Double totalPrice = orderItems.stream()
                .mapToDouble(item -> (item.getPrice() != null ? item.getPrice() : 0.0) * item.getQuantity())
                .sum();

        User user = order.getUser();
        return new OrderDTO(
                order.getOrder_id(),
                order.getOrderDate(),
                order.getStatus(),
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getAddress(),
                user.getPhone(),
                orderItems,
                totalPrice
        );
    }

    public void updateOrderStatus(Long orderId, String status) {
        orderRepository.updateOrderStatus(orderId, status);
        if ("CANCELLED".equalsIgnoreCase(status)) {
            handleRefundAndRestoreQuantity(orderId);
        }
    }

    private void handleRefundAndRestoreQuantity(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Restore product quantities
        for (OrderItem orderItem : order.getOrderItems()) {
            Product product = orderItem.getProduct();
            int restoredQuantity = product.getPro_stock() + orderItem.getQuantity();
            product.setPro_stock(restoredQuantity);
            productRepository.save(product); // Update the product stock
        }

        // Refund the user's balance (if applicable)
        User user = order.getUser();
        double refundAmount = order.getOrderItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
        user.setBudget(user.getBudget() + refundAmount);
        userRepository.save(user);
    }
}
