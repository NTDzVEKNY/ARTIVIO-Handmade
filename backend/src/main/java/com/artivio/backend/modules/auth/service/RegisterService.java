package com.artivio.backend.modules.auth.service;

import lombok.RequiredArgsConstructor;
import com.artivio.backend.modules.auth.dto.response.RegisterResponse;
import com.artivio.backend.modules.auth.model.Role;
import com.artivio.backend.modules.auth.model.User;
import com.artivio.backend.modules.auth.repository.UserRepository;
import com.artivio.backend.modules.auth.dto.request.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class RegisterService {
    @Autowired
    private UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterResponse register(RegisterRequest req) {

        // Check email duplicate
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new RuntimeException("Password và Confirm Password phải giống nhau");
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(Role.USER); // mặc định USER

        User saved = userRepository.save(user);

        return new RegisterResponse(
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getRole(),
                saved.getCreatedAt()
        );
    }
}
