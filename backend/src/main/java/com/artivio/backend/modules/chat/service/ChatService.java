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
import com.artivio.backend.modules.chat.dto.ChatDataResponse;
import com.artivio.backend.modules.chat.mapper.ChatMapper;
import com.artivio.backend.modules.chat.dto.ChatMessageResponse;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRepository chatRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ChatMapper chatMapper;

    private final String UPLOAD_DIR = "uploads/chat/";

    // --- HÀM HELPER ĐỂ LƯU FILE ---
    private String saveFileToSystem(MultipartFile file) {
        if (file == null || file.isEmpty()) return null;
        try {
            // Tạo thư mục nếu chưa tồn tại
            Files.createDirectories(Paths.get(UPLOAD_DIR));

            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path copyLocation = Paths.get(UPLOAD_DIR + fileName);
            Files.copy(file.getInputStream(), copyLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/chat/" + fileName;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi lưu file: " + e.getMessage());
        }
    }

    @Transactional
    public ChatInitiateResponse initiateChat(
            Long artisanId,
            Long productId,
            String title,
            String description,
            Double budget,
            MultipartFile referenceImageFile, // Nhận file ảnh
            String customerEmail
    ) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        User artisan = userRepository.findById(artisanId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nghệ nhân"));

        if (customer.getId().equals(artisan.getId())) {
            throw new RuntimeException("Không thể tự gửi yêu cầu cho chính mình");
        }

        // Xử lý lưu ảnh tham khảo (nếu có)
        String referenceImagePath = null;
        if (referenceImageFile != null && !referenceImageFile.isEmpty()) {
            referenceImagePath = saveFileToSystem(referenceImageFile);
        }

        Chat newChat = Chat.builder()
                .customer(customer)
                .artisan(artisan)
                .status(Chat.ChatStatus.PENDING)
                .product(productId != null ? new Product() {{ setId(productId); }} : null)
                .title(title)
                .description(description)
                .budget(budget)
                .referenceImage(referenceImagePath) // Lưu đường dẫn file
                .createdAt(LocalDateTime.now())
                .build();

        Chat savedChat = chatRepository.save(newChat);

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
        message.setSenderType(request.getSenderId().equals(chat.getCustomer().getId()) ? ChatMessage.SenderType.CUSTOMER : ChatMessage.SenderType.ARTISAN);
        message.setMessage(request.getContent());
        // sentAt được xử lý bởi @PrePersist trong Entity rồi

        return chatMessageRepository.save(message);
    }

    public ChatDataResponse getChatData(Long chatId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        if (!user.getId().equals(chat.getCustomer().getId()) && !user.getId().equals(chat.getArtisan().getId())) {
            throw new RuntimeException("Bạn không có quyền truy cập cuộc trò chuyện này");
        }

        return chatMapper.toResponse(chat);
    }

    public List<ChatMessageResponse> getMessages(Long chatId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        if (!user.getId().equals(chat.getCustomer().getId()) && !user.getId().equals(chat.getArtisan().getId())) {
            throw new RuntimeException("Bạn không có quyền truy cập cuộc trò chuyện này");
        }

        List<ChatMessage> messages = chatMessageRepository.findByChatIdOrderBySentAtAsc(chatId);

        return chatMapper.toMessageResponseList(messages);
    }


    @Transactional
    public ChatMessageResponse processAndSaveMessage(
            Long chatId,
            Long senderId,
            String senderTypeStr,
            String content,
            Boolean isImage,
            MultipartFile file
    ) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String finalContent = content;
        boolean finalIsImage = isImage;

        // Tái sử dụng hàm lưu file
        if (file != null && !file.isEmpty()) {
            finalContent = saveFileToSystem(file);
            finalIsImage = true;
        }

        ChatMessage message = new ChatMessage();
        message.setChat(chat);
        message.setSender(sender);

        try {
            message.setSenderType(ChatMessage.SenderType.valueOf(senderTypeStr.toUpperCase()));
        } catch (IllegalArgumentException e) {
            message.setSenderType(ChatMessage.SenderType.CUSTOMER);
        }

        message.setMessage(finalContent);
        message.setImage(finalIsImage);

        ChatMessage savedMsg = chatMessageRepository.save(message);

        return ChatMessageResponse.builder()
                .id(savedMsg.getId())
                .senderId(sender.getId())
                .senderType(savedMsg.getSenderType())
                .message(savedMsg.getMessage())
                .isImage(savedMsg.isImage())
                .createdAt(savedMsg.getSentAt())
                .build();
    }

    public List<ChatDataResponse> getMyChats(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Chat> chats = chatRepository.findByCustomerOrderByCreatedAtDesc(user);

        return chats.stream().map(chatMapper::toResponse).collect(Collectors.toList());
    }
}