package com.example.keycloak.repository;

import com.example.keycloak.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    @Query("SELECT r FROM Reaction r WHERE r.review.reviewId = :reviewId")
    List<Reaction> findByReviewReviewId(@Param("reviewId") Long reviewId);

    @Query("SELECT r FROM Reaction r WHERE r.reply.replyId = :replyId")
    List<Reaction> findByReplyReplyId(@Param("replyId") Long replyId);
}

