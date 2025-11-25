package com.artivio.backend.modules.auth.service;

import lombok.RequiredArgsConstructor;
import com.artivio.backend.modules.auth.dto.UserResponse;
import com.artivio.backend.modules.auth.model.Role;
import com.artivio.backend.modules.auth.model.User;
import com.artivio.backend.modules.auth.repository.UserRepository;
import com.artivio.backend.modules.auth.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class RegisterService {
    @Autowired
    private UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse register(RegisterRequest req) {

        // Check email duplicate
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new RuntimeException("Password và Confirm Password phải giống nhau");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(Role.USER); // mặc định USER

        User saved = userRepository.save(user);

        return new UserResponse(
                saved.getId(),
                saved.getUsername(),
                saved.getEmail(),
                saved.getRole(),
                saved.getCreatedAt()
        );
    }
}
