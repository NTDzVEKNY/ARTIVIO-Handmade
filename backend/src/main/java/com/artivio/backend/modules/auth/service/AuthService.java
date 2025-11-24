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
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public LoginResponseDTO login(LoginRequestDTO request) {
        try {
            // Bước 1: Xác thực người dùng (Checklist 1.4a - Sai thông tin)
            // Spring Security sẽ dùng AuthenticationManager để kiểm tra username
            // và so sánh mật khẩu đã hash (Checklist [BE])
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            // Nếu sai, ném BadCredentialsException, Spring Security sẽ
            // tự động trả về lỗi 401 Unauthorized (Checklist [BE])
            throw new BadCredentialsException("Email hoặc mật khẩu không đúng");
        }

        // Bước 2: Lấy thông tin User sau khi xác thực thành công
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalStateException("Lỗi không tìm thấy user sau khi đã xác thực"));

        // Bước 3: Tạo JWT token
        var jwtToken = jwtService.generateToken(user);

        // Bước 4: Trả về DTO chứa token và role (Checklist [BE] 1.4b, 1.4c)
        return LoginResponseDTO.builder()
                .token(jwtToken)
                .role(user.getRole()) // Trả về role (ADMIN hoặc USER)
                .build();
    }
}