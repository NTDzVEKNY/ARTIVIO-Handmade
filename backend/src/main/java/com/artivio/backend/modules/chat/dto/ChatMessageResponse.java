package com.artivio.backend.modules.chat.dto;

import com.artivio.backend.modules.chat.model.ChatMessage;

import lombok.Data;

@Data
public class ChatMessageResponse {
    private Long id;
    private Long chatId;
    private Long senderId;
    private ChatMessage.SenderType senderType;
    private boolean isImage;
    private String message;
    private String createdAt;
}