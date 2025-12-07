package com.artivio.backend.modules.chat.controller;

import com.artivio.backend.modules.chat.dto.ChatMessageRequest;
import com.artivio.backend.modules.chat.model.ChatMessage;
import com.artivio.backend.modules.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    // Client gửi tới: /app/chat.sendMessage
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageRequest request) {
        try {
            System.out.println("=== NHẬN TIN NHẮN TỪ SOCKET ===");
            System.out.println("Content: " + request.getContent());
            System.out.println("ChatID: " + request.getChatId());

            // 1. Cố gắng lưu
            ChatMessage savedMessage = chatService.saveMessage(request);
            System.out.println("=== ĐÃ LƯU DATABASE THÀNH CÔNG: ID=" + savedMessage.getId());

            // 2. Gửi cho Client
            String topic = "/topic/chat/" + request.getChatId();
            messagingTemplate.convertAndSend(topic, savedMessage);

        } catch (Exception e) {
            // Nếu lỗi, in ra console để biết ngay
            System.err.println("!!! LỖI KHI LƯU TIN NHẮN !!!");
            e.printStackTrace();
        }
    }
}