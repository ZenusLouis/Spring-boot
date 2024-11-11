package com.example.keycloak.service;

import com.example.keycloak.repository.ProductRepository;
import com.example.keycloak.repository.CategoryRepository;
import com.example.keycloak.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    public Map<String, Object> getDashboardStatistics() {
        Map<String, Object> stats = new HashMap<>();

        // Total products
        stats.put("productCount", productRepository.count());

        // Total categories
        stats.put("categoryCount", categoryRepository.count());

        // Orders by status
        stats.put("pendingOrders", orderRepository.countByStatus("PENDING"));
        stats.put("shippedOrders", orderRepository.countByStatus("SHIPPING"));
        stats.put("deliveredOrders", orderRepository.countByStatus("DELIVERED"));
        stats.put("cancelledOrders", orderRepository.countByStatus("CANCELLED"));

        // Income from delivered orders
        BigDecimal totalIncome = orderRepository.calculateTotalIncome();
        stats.put("income", totalIncome != null ? totalIncome : BigDecimal.ZERO);

        return stats;
    }
}
