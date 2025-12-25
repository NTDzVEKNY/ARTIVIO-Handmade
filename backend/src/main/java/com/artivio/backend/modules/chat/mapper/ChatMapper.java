package com.artivio.backend.modules.chat.mapper;

import com.artivio.backend.modules.chat.dto.ChatDataResponse;
import com.artivio.backend.modules.chat.model.Chat;
import org.springframework.stereotype.Component;
import com.artivio.backend.modules.chat.dto.ChatMessageResponse;
import com.artivio.backend.modules.chat.model.ChatMessage;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ChatMapper {

    public ChatDataResponse toResponse(Chat chat) {
        if (chat == null) return null;

        return ChatDataResponse.builder()
                .id(chat.getId())
                .status(chat.getStatus().name())
                .title(chat.getTitle())
                .description(chat.getDescription())
                .budget(chat.getBudget())
                .referenceImage(chat.getReferenceImage())
                .createdAt(chat.getCreatedAt())
                // Map Customer
                .customer(chat.getCustomer() != null ?
                        new ChatDataResponse.CustomerDTO() {{
                            setId(chat.getCustomer().getId());
                            setName(chat.getCustomer().getUsername());
                            setEmail(chat.getCustomer().getEmail());
                        }} : null)
                // Map Artisan
                .artisan(chat.getArtisan() != null ?
                        new ChatDataResponse.ArtisanDTO() {{
                            setId(chat.getArtisan().getId());
                            setName(chat.getArtisan().getUsername());
                            setEmail(chat.getArtisan().getEmail());
                        }} : null)
                // Map Product
                .product(chat.getProduct() != null ?
                        new ChatDataResponse.ProductDTO() {{
                            setId(chat.getProduct().getId());
                            setName(chat.getProduct().getProductName());
                            setDescription(chat.getProduct().getDescription());
                            setPrice(chat.getProduct().getPrice());
                            setImage(chat.getProduct().getImage());
                        }} : null)
                // Map Messages
                .messages(toMessageResponseList(chat.getMessages()))
                .build();
    }

    public ChatMessageResponse toMessageResponse(ChatMessage message) {
        if (message == null) return null;

        ChatMessageResponse response = new ChatMessageResponse();
        response.setId(message.getId());

        // Map Chat ID
        if (message.getChat() != null) {
            response.setChatId(message.getChat().getId());
        }

        // Map Sender ID (Giả sử sender là User entity)
        if (message.getSender() != null) {
            response.setSenderId(message.getSender().getId());
        }

        response.setSenderType(message.getSenderType());
        response.setImage(message.isImage());
        response.setMessage(message.getMessage());

        // Xử lý Date -> String (Giả sử getCreatedAt trả về LocalDateTime hoặc Date)
        if (message.getSentAt() != null) {
            response.setCreatedAt(message.getSentAt().toString());
            // Hoặc format đẹp hơn:
            // message.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        }

        return response;
    }

    // 2. Map List Messages
    public List<ChatMessageResponse> toMessageResponseList(List<ChatMessage> messages) {
        if (messages == null) return List.of();
        return messages.stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }
}