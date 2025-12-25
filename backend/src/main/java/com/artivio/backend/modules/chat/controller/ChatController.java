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

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

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
}