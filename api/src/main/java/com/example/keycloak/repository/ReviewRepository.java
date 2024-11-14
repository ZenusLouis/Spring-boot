package com.example.keycloak.repository;

import com.example.keycloak.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    @Query("SELECT r FROM Review r WHERE r.product.pro_id = :productId ORDER BY r.createdAt DESC")
    List<Review> findReviewsByProductIdOrderByCreatedAtDesc(@Param("productId") Long productId);

    @Query("SELECT r FROM Review r WHERE r.product.pro_id = :productId")
    List<Review> findReviewsByProductId(@Param("productId") Long productId);
}
