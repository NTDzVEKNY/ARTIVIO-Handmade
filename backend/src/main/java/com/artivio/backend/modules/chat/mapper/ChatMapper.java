package com.artivio.backend.modules.chat.mapper;

import com.artivio.backend.modules.chat.dto.ChatDataResponse;
import com.artivio.backend.modules.chat.dto.ChatMessageResponse;
import com.artivio.backend.modules.chat.model.Chat;
import com.artivio.backend.modules.chat.model.ChatMessage;
import org.springframework.stereotype.Component;
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
                .customer(chat.getCustomer() != null ?
                        new ChatDataResponse.CustomerDTO() {{
                            setId(chat.getCustomer().getId());
                            setName(chat.getCustomer().getUsername());
                            setEmail(chat.getCustomer().getEmail());
                        }} : null)
                .artisan(chat.getArtisan() != null ?
                        new ChatDataResponse.ArtisanDTO() {{
                            setId(chat.getArtisan().getId());
                            setName(chat.getArtisan().getUsername());
                            setEmail(chat.getArtisan().getEmail());
                        }} : null)
                .product(chat.getProduct() != null ?
                        new ChatDataResponse.ProductDTO() {{
                            setId(chat.getProduct().getId());
                            setName(chat.getProduct().getProductName());
                            setDescription(chat.getProduct().getDescription());
                            setPrice(chat.getProduct().getPrice());
                            setImage(chat.getProduct().getImage());
                        }} : null)
                .messages(toMessageResponseList(chat.getMessages()))
                .build();
    }

    public ChatMessageResponse toMessageResponse(ChatMessage message) {
        if (message == null) return null;

        // Using Builder is cleaner and safer than 'new' + setters
        return ChatMessageResponse.builder()
                .id(message.getId())
                .chatId(message.getChat() != null ? message.getChat().getId() : null)
                .senderId(message.getSender() != null ? message.getSender().getId() : null)

                // Convert Enum to String to match DTO
                .senderType(message.getSenderType() != null ? message.getSenderType() : null)

                .message(message.getMessage())
                .isImage(message.isImage())

                // Fix: Pass LocalDateTime directly, do not use .toString()
                .createdAt(message.getSentAt())
                .build();
    }

    public List<ChatMessageResponse> toMessageResponseList(List<ChatMessage> messages) {
        if (messages == null) return List.of();
        return messages.stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }
}