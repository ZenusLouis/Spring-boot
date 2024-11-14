package com.example.keycloak.service;

import com.example.keycloak.dto.ReplyDTO;
import com.example.keycloak.dto.ReviewDTO;
import com.example.keycloak.entity.*;
import com.example.keycloak.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReplyRepository replyRepository;
    private final ReactionRepository reactionRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public ReviewService(ReviewRepository reviewRepository, ReplyRepository replyRepository, ReactionRepository reactionRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.replyRepository = replyRepository;
        this.reactionRepository = reactionRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Review addReview(Long productId, Long userId, Review review) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User must be an existing entity"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product must be an existing entity"));
        review.setUser(user);
        review.setProduct(product);
        return reviewRepository.save(review);
    }

    @Transactional
    public List<ReviewDTO> getReviewsByProductId(Long productId) {
        List<Review> reviews = reviewRepository.findReviewsByProductIdOrderByCreatedAtDesc(productId);
        return reviews.stream().map(ReviewDTO::new).collect(Collectors.toList());
    }

    @Transactional
    public Reply addReply(Long reviewId, Long userId, Reply reply) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        reply.setReview(review);
        reply.setUser(user);
        return replyRepository.save(reply);
    }

    public List<ReplyDTO> getRepliesByReviewId(Long reviewId) {
        return replyRepository.findByReviewReviewId(reviewId).stream()
                .map(ReplyDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public Reaction reactToReview(Long reviewId, Long userId, Reaction reaction) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        reaction.setReview(review);
        reaction.setUser(user);
        reactionRepository.save(reaction);

        // Update count based on reaction type
        switch (reaction.getReactionType()) {
            case LIKE -> review.setLikeCount(review.getLikeCount() + 1);
            case LOVE -> review.setLoveCount(review.getLoveCount() + 1);
            case HAHA -> review.setHahaCount(review.getHahaCount() + 1);
            case WOW -> review.setWowCount(review.getWowCount() + 1);
            case SAD -> review.setSadCount(review.getSadCount() + 1);
            case ANGRY -> review.setAngryCount(review.getAngryCount() + 1);
        }

        reviewRepository.save(review);
        return reaction;
    }

    @Transactional
    public Reaction reactToReply(Long replyId, Long userId, Reaction reaction) {
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        reaction.setReply(reply);
        reaction.setUser(user);
        reactionRepository.save(reaction);

        // Update count based on reaction type
        switch (reaction.getReactionType()) {
            case LIKE -> reply.setLikeCount(reply.getLikeCount() + 1);
            case LOVE -> reply.setLoveCount(reply.getLoveCount() + 1);
            case HAHA -> reply.setHahaCount(reply.getHahaCount() + 1);
            case WOW -> reply.setWowCount(reply.getWowCount() + 1);
            case SAD -> reply.setSadCount(reply.getSadCount() + 1);
            case ANGRY -> reply.setAngryCount(reply.getAngryCount() + 1);
        }

        replyRepository.save(reply);
        return reaction;
    }

    public Double calculateAverageRating(Long productId) {
        List<Review> reviews = reviewRepository.findReviewsByProductId(productId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        double totalRating = reviews.stream().mapToInt(Review::getRating).sum();
        return totalRating / reviews.size();
    }
}
