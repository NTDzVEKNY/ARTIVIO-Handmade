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

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // API: GET /api/chat/initiate?productId=10
    @PostMapping("/initiate")
    public ResponseEntity<ChatInitiateResponse> initiateChat(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        ChatInitiateResponse response = chatService.initiateChat(request, userDetails.getUsername()); // ở đây là email
        return ResponseEntity.ok(response);
    }
}