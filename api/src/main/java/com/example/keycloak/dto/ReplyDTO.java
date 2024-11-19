package com.example.keycloak.dto;

import com.example.keycloak.entity.Reply;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReplyDTO {
    Long replyId;
    String content;
    Date createdAt;
    Long userId;
    String username;

    public ReplyDTO(Reply reply) {
        this.replyId = reply.getReplyId();
        this.content = reply.getContent();
        this.createdAt = reply.getCreatedAt();
        this.userId = reply.getUser().getId();
        this.username = reply.getUser().getUsername();
    }
}

