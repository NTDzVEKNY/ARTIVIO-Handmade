package com.artivio.backend.modules.chat.dto;

import com.artivio.backend.modules.chat.model.ChatMessage;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;

import java.util.List;
import java.time.LocalDateTime;

@Data
@Builder
public class ChatDataResponse {
    private Long id;
    private CustomerDTO customer;
    private ArtisanDTO artisan;
    private ProductDTO product = null ;
    private String status;
    private String title;
    private String description;
    private Double budget;
    private String referenceImage;
    private LocalDateTime createdAt;
    private List<ChatMessage> messages;

    @Data
    public static class CustomerDTO {
        private Long id;
        private String name;
        private String email;
    }

    @Data
    public static class ArtisanDTO {
        private Long id;
        private String name;
        private String email;
    }
    @Data
    public static class ProductDTO {
        private Long id;
        private String name;
        private String description;
        private Double price;
        private String image;
    }

}