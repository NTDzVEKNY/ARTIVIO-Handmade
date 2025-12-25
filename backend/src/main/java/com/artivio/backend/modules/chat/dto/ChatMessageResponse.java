package com.artivio.backend.modules.chat.dto;

import com.artivio.backend.modules.chat.model.ChatMessage;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private Long chatId;
    private Long senderId;
    private ChatMessage.SenderType senderType;
    private boolean isImage;
    private String message;
    private LocalDateTime createdAt;
}