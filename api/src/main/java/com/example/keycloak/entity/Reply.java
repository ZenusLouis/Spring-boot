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
}
