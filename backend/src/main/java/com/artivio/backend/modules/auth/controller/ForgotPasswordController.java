package com.artivio.backend.modules.auth.controller;

import com.artivio.backend.modules.auth.dto.request.ForgotPasswordRequestDTO;
import com.artivio.backend.modules.auth.dto.request.ResetPasswordRequestDTO;
import com.artivio.backend.modules.auth.service.ForgotPasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/")
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        return ResponseEntity.ok(forgotPasswordService.requestForgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        return ResponseEntity.ok(forgotPasswordService.resetPassword(request));
    }
}