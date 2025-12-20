package com.artivio.backend.modules.auth.service;

import com.artivio.backend.modules.auth.dto.request.LoginRequestDTO;
import com.artivio.backend.modules.auth.dto.response.LoginResponseDTO;
import com.artivio.backend.modules.auth.model.User;
import com.artivio.backend.modules.auth.repository.UserRepository;
import com.artivio.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public LoginResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("Lỗi không tìm thấy user sau khi đã xác thực"));
        var jwtToken = jwtService.generateToken(user);

        return LoginResponseDTO.builder()
                .token(jwtToken)
                .role(user.getRole())
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }

}