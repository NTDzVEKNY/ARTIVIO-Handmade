package com.artivio.backend.modules.chat.controller;

import com.artivio.backend.modules.chat.dto.ChatInitiateResponse;
import com.artivio.backend.modules.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.artivio.backend.modules.chat.dto.ChatRequest;
import com.artivio.backend.modules.chat.dto.ChatDataResponse;
import com.artivio.backend.modules.chat.dto.ChatMessageResponse;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @PostMapping("/initiate")
    public ResponseEntity<ChatInitiateResponse> initiateChat(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        ChatInitiateResponse response = chatService.initiateChat(request, userDetails.getUsername()); // ở đây là email
        return ResponseEntity.ok(response);
    }

    @GetMapping("/chatData")
    public ResponseEntity<ChatDataResponse> getChatData(
            @RequestParam Long chatId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(chatService.getChatData(chatId, userDetails.getUsername()));
    }

    @GetMapping("/getMessages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @RequestParam Long chatId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(chatService.getMessages(chatId, userDetails.getUsername()));
    }

    // 3. API MỚI: Xử lý gửi tin nhắn (Text + Ảnh)
    @PostMapping(value = "/sendMessage", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @RequestParam("chatId") Long chatId,
            @RequestParam("senderId") Long senderId, // Có thể lấy từ userDetails để bảo mật hơn
            @RequestParam("senderType") String senderType,
            @RequestParam(value = "content", required = false, defaultValue = "") String content,
            @RequestParam(value = "isImage", defaultValue = "false") Boolean isImage,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            // A. Gọi Service xử lý lưu vào DB + Upload ảnh
            ChatMessageResponse savedMessage = chatService.processAndSaveMessage(
                    chatId, senderId, senderType, content, isImage, file
            );

            // B. BẮN SOCKET: Thông báo cho các client đang subscribe
            // Topic phải khớp với frontend: /topic/chat/{chatId}
            String topic = "/topic/chat/" + chatId;
            messagingTemplate.convertAndSend(topic, savedMessage);

            // C. Trả về kết quả cho người gửi (để axios hoàn tất)
            return ResponseEntity.ok(savedMessage);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}