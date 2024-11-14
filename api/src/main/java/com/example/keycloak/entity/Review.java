package com.example.keycloak.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Reviews")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long reviewId;

    String content;
    Integer rating;

    @Temporal(TemporalType.TIMESTAMP)
    Date createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-review")
    User user;

    @ManyToOne
    @JoinColumn(name = "pro_id", nullable = false)
    Product product;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL)
    @JsonManagedReference("review-reply")
    List<Reply> replies;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL)
    @JsonManagedReference("review-reaction")
    List<Reaction> reactions;

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
    }

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
