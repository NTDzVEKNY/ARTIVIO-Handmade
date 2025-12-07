package com.artivio.backend.modules.chat.controller;

import com.artivio.backend.modules.chat.dto.ChatInitiateResponse;
import com.artivio.backend.modules.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // API: GET /api/chat/initiate?productId=10
    @GetMapping("/initiate")
    public ResponseEntity<ChatInitiateResponse> initiateChat(
            @RequestParam Long productId,
            @AuthenticationPrincipal UserDetails userDetails // Lấy user từ Security Context
    ) {
        // Giả sử lấy ID user từ UserDetails (cần logic trích xuất ID thực tế của bạn)
        // Ví dụ tạm: Integer userId = Integer.parseInt(userDetails.getUsername());
        // Trong thực tế bạn có thể cast UserDetails về CustomUserDetails để lấy ID
       Long customerId = 1L; // HARD CODE ĐỂ TEST, hãy thay bằng logic lấy ID thật

        ChatInitiateResponse response = chatService.initiateChat(customerId, productId);
        return ResponseEntity.ok(response);
    }
}