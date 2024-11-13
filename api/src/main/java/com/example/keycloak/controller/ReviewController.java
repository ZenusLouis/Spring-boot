package com.example.keycloak.controller;

import com.example.keycloak.dto.ReviewDTO;
import com.example.keycloak.dto.ReplyDTO;
import com.example.keycloak.entity.Reply;
import com.example.keycloak.entity.Review;
import com.example.keycloak.entity.Reaction;
import com.example.keycloak.service.ReviewService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/{productId}/{userId}")
    public Review addReview(@PathVariable Long productId, @PathVariable Long userId, @RequestBody Review review) {
        return reviewService.addReview(productId, userId, review);
    }

    @GetMapping("/{productId}")
    public List<ReviewDTO> getReviewsByProductId(@PathVariable Long productId) {
        return reviewService.getReviewsByProductId(productId);
    }

    @PostMapping("/{reviewId}/reply/{userId}")
    public Reply addReply(@PathVariable Long reviewId, @PathVariable Long userId, @RequestBody Reply reply) {
        return reviewService.addReply(reviewId, userId, reply);
    }

    @GetMapping("/{reviewId}/replies")
    public List<ReplyDTO> getRepliesByReviewId(@PathVariable Long reviewId) {
        return reviewService.getRepliesByReviewId(reviewId);
    }

    @PostMapping("/{reviewId}/react/{userId}")
    public Reaction reactToReview(@PathVariable Long reviewId, @PathVariable Long userId, @RequestBody Reaction reaction) {
        return reviewService.reactToReview(reviewId, userId, reaction);
    }

    @PostMapping("/reply/{replyId}/react/{userId}")
    public Reaction reactToReply(@PathVariable Long replyId, @PathVariable Long userId, @RequestBody Reaction reaction) {
        return reviewService.reactToReply(replyId, userId, reaction);
    }

    @GetMapping("/{productId}/average-rating")
    public Double getAverageRating(@PathVariable Long productId) {
        return reviewService.calculateAverageRating(productId);
    }
}
