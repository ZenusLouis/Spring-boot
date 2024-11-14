package com.example.keycloak.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "reactions")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Reaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long reactionId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-reaction")
    User user;

    @ManyToOne
    @JoinColumn(name = "review_id", nullable = true)
    @JsonBackReference("review-reaction")
    Review review;

    @ManyToOne
    @JoinColumn(name = "reply_id", nullable = true)
    @JsonBackReference("reply-reaction")
    Reply reply;

    @Enumerated(EnumType.STRING)
    ReactionType reactionType;
}
