package com.artivio.backend.modules.chat.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatInitiateResponse {
    private Long chatId;
    private Long artisanId;
    private String artisanName;
    private String status;
    private String socketTopic; // Ví dụ: "/topic/chat/{chatId}" để FE subcribe
}