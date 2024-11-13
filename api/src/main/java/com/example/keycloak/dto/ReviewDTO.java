package com.example.keycloak.dto;

import com.example.keycloak.entity.Review;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewDTO {
    Long reviewId;
    String content;
    Integer rating;
    Date createdAt;
    Long userId;
    Long productId;
    int likeCount;
    int loveCount;
    int hahaCount;
    int wowCount;
    int sadCount;
    int angryCount;
    private List<ReplyDTO> replies;

    public ReviewDTO(Review review) {
        this.reviewId = review.getReviewId();
        this.content = review.getContent();
        this.rating = review.getRating();
        this.createdAt = review.getCreatedAt();
        this.userId = review.getUser().getId();
        this.productId = review.getProduct().getPro_id();
        this.likeCount = review.getLikeCount();
        this.loveCount = review.getLoveCount();
        this.hahaCount = review.getHahaCount();
        this.wowCount = review.getWowCount();
        this.sadCount = review.getSadCount();
        this.angryCount = review.getAngryCount();
        this.replies = review.getReplies().stream()
                .map(ReplyDTO::new)
                .collect(Collectors.toList());
    }
}

