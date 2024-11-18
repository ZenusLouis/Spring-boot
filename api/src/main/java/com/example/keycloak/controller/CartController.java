package com.example.keycloak.controller;

import com.example.keycloak.dto.CartItem;
import com.example.keycloak.entity.Product;
import com.example.keycloak.entity.User;
import com.example.keycloak.repository.ProductRepository;
import com.example.keycloak.repository.UserRepository;
import com.example.keycloak.service.OrderService;
import jakarta.servlet.http.HttpSession;
import org.camunda.bpm.engine.RuntimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RuntimeService runtimeService;

    @PostMapping("/add")
    public ResponseEntity<String> addToCart(@RequestBody CartItem cartItem, HttpSession session) {
        List<CartItem> cartItems = (List<CartItem>) session.getAttribute("cartItems");

        if (cartItems == null) {
            cartItems = new ArrayList<>();
            session.setAttribute("cartItems", cartItems);
        }

        Product product = productRepository.findById(cartItem.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + cartItem.getProductId()));
        cartItem.setPrice(product.getPro_price());

        Optional<CartItem> existingItem = cartItems.stream()
                .filter(item -> item.getProductId().equals(cartItem.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + cartItem.getQuantity());
        } else {
            cartItems.add(cartItem);
        }

        session.setAttribute("cartItems", cartItems);
        System.out.println("Session ID: " + session.getId());
        System.out.println("Current Cart Items:");
        for (CartItem item : cartItems) {
            System.out.println("Product ID: " + item.getProductId() +
                    ", Quantity: " + item.getQuantity() +
                    ", Price: " + item.getPrice());
        }

        Map<String, Object> variables = new HashMap<>();
        variables.put("cartItems", cartItems);

        runtimeService.startProcessInstanceByKey("checkout_process", variables);

        return ResponseEntity.ok("Product added to cart and process started");
    }

    @GetMapping("/get")
    public ResponseEntity<List<CartItem>> getCart(HttpSession session) {
        List<CartItem> cartItems = (List<CartItem>) session.getAttribute("cartItems");
        return ResponseEntity.ok(cartItems != null ? cartItems : new ArrayList<>());
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateQuantity(@RequestBody CartItem cartItem, HttpSession session) {
        List<CartItem> cartItems = (List<CartItem>) session.getAttribute("cartItems");
        if (cartItems != null) {
            cartItems.stream()
                    .filter(item -> item.getProductId().equals(cartItem.getProductId()))
                    .findFirst()
                    .ifPresent(item -> item.setQuantity(cartItem.getQuantity()));
            session.setAttribute("cartItems", cartItems);
        }
        return ResponseEntity.ok("Quantity updated");
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<String> removeItem(@PathVariable Long productId, HttpSession session) {
        List<CartItem> cartItems = (List<CartItem>) session.getAttribute("cartItems");
        if (cartItems != null) {
            cartItems.removeIf(item -> item.getProductId().equals(productId));
            session.setAttribute("cartItems", cartItems);
        }
        return ResponseEntity.ok("Item removed from cart");
    }

    @PostMapping("/checkout")
    public ResponseEntity<String> checkout(@RequestBody Map<String, Object> payload, HttpSession session) {
        Long userId = ((Number) payload.get("userId")).longValue();
        String phone = (String) payload.get("phone");
        String address = (String) payload.get("address");

        List<CartItem> cartItems = (List<CartItem>) session.getAttribute("cartItems");

        if (cartItems == null || cartItems.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cart is empty");
        }

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found");
        }

        User user = userOptional.get();

        if (phone != null && !phone.isEmpty()) {
            user.setPhone(phone);
        }
        if (address != null && !address.isEmpty()) {
            user.setAddress(address);
        }

        double totalCost = 0.0;
        for (CartItem item : cartItems) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()));
            double itemCost = product.getPro_price() * item.getQuantity();
            totalCost += itemCost;

            if (product.getPro_stock() < item.getQuantity()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Insufficient stock for product: " + product.getPro_name());
            }
            product.setPro_stock(product.getPro_stock() - item.getQuantity());
            productRepository.save(product);
        }

        if (user.getBudget() < totalCost) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Not enough money in the account");
        }

        user.setBudget(user.getBudget() - totalCost);
        userRepository.save(user);

        boolean success = orderService.processOrder(userId, cartItems);
        if (success) {
            session.removeAttribute("cartItems");
            return ResponseEntity.ok("Checkout successful!");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Checkout failed.");
        }
    }
}
