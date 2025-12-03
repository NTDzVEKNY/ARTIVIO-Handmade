package com.artivio.backend.modules.chat.dto;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private Long chatId;
    private Long senderId; // Trong thực tế nên lấy từ Token user đang login
    private String content;
}