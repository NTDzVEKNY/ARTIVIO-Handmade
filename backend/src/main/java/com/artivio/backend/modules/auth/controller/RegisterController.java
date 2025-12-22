package com.artivio.backend.modules.auth.controller;

import com.artivio.backend.modules.auth.dto.response.RegisterResponse;
import com.artivio.backend.modules.auth.model.User;
import com.artivio.backend.modules.auth.dto.request.RegisterRequest;
import com.artivio.backend.modules.auth.dto.request.VerifyAccountRequest;
import com.artivio.backend.modules.auth.service.RegisterService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.artivio.backend.modules.auth.service.VerifyService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class RegisterController {
    private final RegisterService authService;
    private final VerifyService verifyService;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/verifyAccount")
    public ResponseEntity<String> verifyAccount(
            @Valid @RequestBody VerifyAccountRequest request
    ) {
        return ResponseEntity.ok(verifyService.verifyAccount(request));
    }
}
