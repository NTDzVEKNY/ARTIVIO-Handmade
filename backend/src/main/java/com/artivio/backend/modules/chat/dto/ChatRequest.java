package com.artivio.backend.modules.chat.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class ChatRequest {
    private Long artisanId;
    private Long productId;
    private String title;
    private String description;
    private Double budget;
    private String referenceImage;
}