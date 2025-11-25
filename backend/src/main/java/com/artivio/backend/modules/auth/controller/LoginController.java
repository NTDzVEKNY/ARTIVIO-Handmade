package com.artivio.backend.modules.auth.controller;

import com.artivio.backend.modules.auth.dto.request.LoginRequestDTO;
import com.artivio.backend.modules.auth.dto.response.LoginResponseDTO;
import com.artivio.backend.modules.auth.service.LoginService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;


@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LoginController {
    @Autowired
    private final LoginService loginService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO request
    ) {
        LoginResponseDTO response = loginService.login(request);
        return ResponseEntity.ok(response);
    }
}