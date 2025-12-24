package com.artivio.backend.modules.chat.service;

import com.artivio.backend.modules.chat.model.User;
import com.artivio.backend.modules.chat.repository.UserRepository;
import com.artivio.backend.modules.chat.dto.ChatInitiateResponse;
import com.artivio.backend.modules.chat.model.Chat;
import com.artivio.backend.modules.chat.repository.ChatRepository;
import com.artivio.backend.modules.chat.model.Product;
import com.artivio.backend.modules.chat.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.artivio.backend.modules.chat.dto.ChatMessageRequest;
import com.artivio.backend.modules.chat.model.ChatMessage;
import com.artivio.backend.modules.chat.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import com.artivio.backend.modules.chat.dto.ChatRequest;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;
    private final ChatRepository chatRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatInitiateResponse initiateChat(ChatRequest request, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        User artisan = userRepository.findById(request.getArtisanId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nghệ nhân"));

        // 1. Validate cơ bản
        if (customer.getId().equals(artisan.getId())) {
            throw new RuntimeException("Không thể tự gửi yêu cầu cho chính mình");
        }

        Product product = productRepository.findById(request.getProductId()).orElse(null);

        // Mỗi lần gọi API này là một lần mở một "Deal" hoặc "Project" mới
        Chat newChat = Chat.builder()
                .customer(customer)
                .artisan(artisan)
                .status(Chat.ChatStatus.PENDING)
                .product(product)
                .title(request.getTitle())
                .description(request.getDescription())
                .budget(request.getBudget())
                .referenceImage(request.getReferenceImage())
                .createdAt(LocalDateTime.now())
                .build();

        Chat savedChat = chatRepository.save(newChat);

        // 3. Trả về kết quả
        return ChatInitiateResponse.builder()
                .chatId(savedChat.getId())
                .artisanId(artisan.getId())
                .artisanName(artisan.getUsername())
                .status(savedChat.getStatus().name())
                .socketTopic("/topic/chat/" + savedChat.getId())
                .build();
    }

    @Transactional
    public ChatMessage saveMessage(ChatMessageRequest request) {
        Chat chat = chatRepository.findById(request.getChatId())
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatMessage message = new ChatMessage();
        message.setChat(chat);
        message.setSender(sender);
        message.setMessage(request.getContent());
        // sentAt được xử lý bởi @PrePersist trong Entity rồi

        return chatMessageRepository.save(message);
    }
}