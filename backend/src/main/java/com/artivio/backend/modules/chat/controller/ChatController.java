package com.artivio.backend.modules.chat.controller;

import com.artivio.backend.modules.chat.dto.ChatInitiateResponse;
import com.artivio.backend.modules.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.artivio.backend.modules.chat.dto.ChatDataResponse;
import com.artivio.backend.modules.chat.dto.ChatMessageResponse;
import java.util.List;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    // --- SỬA ĐỔI ENDPOINT NÀY ---
    @PostMapping(value = "/initiate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ChatInitiateResponse> initiateChat(
            @RequestParam("artisanId") Long artisanId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "productId", required = false) Long productId,
            @RequestParam(value = "budget", required = false) Double budget,
            @RequestParam(value = "reference_image", required = false) MultipartFile referenceImage, // Key phải khớp với frontend
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Gọi Service với các tham số rời rạc hoặc build DTO tại đây
        ChatInitiateResponse response = chatService.initiateChat(
                artisanId, productId, title, description, budget, referenceImage, userDetails.getUsername()
        );
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

    @PostMapping(value = "/sendMessage", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @RequestParam("chatId") Long chatId,
            @RequestParam("senderId") Long senderId,
            @RequestParam("senderType") String senderType,
            @RequestParam(value = "content", required = false, defaultValue = "") String content,
            @RequestParam(value = "isImage", defaultValue = "false") Boolean isImage,
            @RequestParam(value = "type", defaultValue = "TEXT") String type,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            ChatMessageResponse savedMessage = chatService.processAndSaveMessage(
                    chatId, senderId, senderType, content, isImage, type, file
            );
            String topic = "/topic/chat/" + chatId;
            messagingTemplate.convertAndSend(topic, savedMessage);
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/my-chats")
    public ResponseEntity<List<ChatDataResponse>> getMyChats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(chatService.getMyChats(userDetails.getUsername()));
    }

    @GetMapping("/all-chats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ChatDataResponse>> getAllChats() {
        return ResponseEntity.ok(chatService.getAllChats());
    }


}