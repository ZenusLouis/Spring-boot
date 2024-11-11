package com.example.keycloak.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import com.example.keycloak.entity.Order;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Override
    @EntityGraph(attributePaths = {"orderItems", "orderItems.product"})
    List<Order> findAll();

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId")
    List<Order> findByUserId(@Param("userId") Long userId);

    @EntityGraph(attributePaths = {"orderItems", "orderItems.product"})
    Optional<Order> findById(Long id);

    long countByStatus(String status);

    @Query("SELECT SUM(oi.price * oi.quantity) FROM OrderItem oi WHERE oi.order.status IN ('DELIVERED', 'SHIPPING')")
    BigDecimal calculateTotalIncome();

    @Query("SELECT CAST(YEAR(o.orderDate) AS integer) as year, " +
            "CAST(MONTH(o.orderDate) AS integer) as month, " +
            "SUM(CAST(oi.price * oi.quantity AS bigdecimal)) as totalIncome " +
            "FROM Order o JOIN o.orderItems oi " +
            "WHERE o.status IN ('DELIVERED', 'SHIPPING') " +
            "GROUP BY YEAR(o.orderDate), MONTH(o.orderDate) " +
            "ORDER BY YEAR(o.orderDate), MONTH(o.orderDate)")
    List<Map<String, Object>> calculateMonthlyIncome();

    @Query("SELECT CAST(YEAR(o.orderDate) AS integer) as year, " +
            "CEILING(MONTH(o.orderDate) / 3.0) as quarter, " +
            "SUM(CAST(oi.price * oi.quantity AS bigdecimal)) as totalIncome " +
            "FROM Order o JOIN o.orderItems oi " +
            "WHERE o.status IN ('DELIVERED', 'SHIPPING') " +
            "GROUP BY YEAR(o.orderDate), CEILING(MONTH(o.orderDate) / 3.0) " +
            "ORDER BY YEAR(o.orderDate), CEILING(MONTH(o.orderDate) / 3.0)")
    List<Map<String, Object>> calculateQuarterlyIncome();

    @Query("SELECT EXTRACT(DAY FROM o.orderDate) as day, " +
            "SUM(CAST(oi.price * oi.quantity AS bigdecimal)) as totalIncome " +
            "FROM Order o JOIN o.orderItems oi " +
            "WHERE o.status IN ('DELIVERED', 'SHIPPING') AND EXTRACT(MONTH FROM o.orderDate) = :month " +
            "GROUP BY EXTRACT(DAY FROM o.orderDate) " +
            "ORDER BY EXTRACT(DAY FROM o.orderDate)")
    List<Map<String, Object>> calculateDailyIncomeInMonth(@Param("month") int month);

    @Modifying
    @Transactional
    @Query("UPDATE Order o SET o.status = :status WHERE o.order_id = :orderId")
    void updateOrderStatus(@Param("orderId") Long orderId, @Param("status") String status);

}
