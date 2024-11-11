package com.example.keycloak.repository;

import com.example.keycloak.entity.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p ORDER BY p.pro_id ASC")
    List<Product> findAllByOrderByProIdDesc();

    List<Product> findAllByOrderByCreatedAtAsc();

    @Query(value = "SELECT * FROM Products ORDER BY created_at DESC LIMIT 4", nativeQuery = true)
    List<Product> findTop4ByOrderByCreatedAtDesc();

    @Query("SELECT p FROM Product p JOIN OrderItem oi ON p.pro_id = oi.product.pro_id " +
            "GROUP BY p.pro_id " +
            "ORDER BY SUM(oi.quantity) DESC")
    List<Product> findTopBestSellers(Pageable pageable);
}
