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

@Service
@RequiredArgsConstructor
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;
    private final ChatRepository chatRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatInitiateResponse initiateChat(Long customerId, Long productId) {
        // 1. Tìm sản phẩm để biết ai là Nghệ nhân (Artisan)
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        User artisan = product.getArtisan(); // Giả định Product có quan hệ Artisan
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại"));

        // Không cho phép tự chat với chính mình (nếu Artisan tự mua hàng của mình)
        if (customer.getId()==artisan.getId()) {
            throw new RuntimeException("Bạn không thể chat yêu cầu với chính mình");
        }

        // 2. Kiểm tra xem đã có chat đang OPEN chưa
        Chat chat = chatRepository.findOpenChat(customer.getId(), artisan.getId())
                .orElseGet(() -> {
                    // 3. Nếu chưa có, tạo mới
                    Chat newChat = Chat.builder()
                            .customer(customer)
                            .artisan(artisan)
                            .status(Chat.ChatStatus.PENDING)
                            .build();
                    return chatRepository.save(newChat);
                });

        // 4. Trả về thông tin để FE kết nối WebSocket
        return ChatInitiateResponse.builder()
                .chatId(chat.getId())
                .artisanId(artisan.getId())
                .artisanName(artisan.getUsername())
                .status(chat.getStatus().name())
                .socketTopic("/topic/chat/" + chat.getId())
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