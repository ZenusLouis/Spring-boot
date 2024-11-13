package com.example.keycloak.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "replies")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Reply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long replyId;

    String content;

    @Temporal(TemporalType.TIMESTAMP)
    Date createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-reply")
    User user;

    @ManyToOne
    @JoinColumn(name = "review_id", nullable = false)
    @JsonBackReference("review-reply")
    Review review;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
    }

    // Reaction count fields
    @Column(name = "like_count", nullable = false, columnDefinition = "int default 0")
    int likeCount;

    @Column(name = "love_count", nullable = false, columnDefinition = "int default 0")
    int loveCount;

    @Column(name = "haha_count", nullable = false, columnDefinition = "int default 0")
    int hahaCount;

    @Column(name = "wow_count", nullable = false, columnDefinition = "int default 0")
    int wowCount;

    @Column(name = "sad_count", nullable = false, columnDefinition = "int default 0")
    int sadCount;

    @Column(name = "angry_count", nullable = false, columnDefinition = "int default 0")
    int angryCount;
}
