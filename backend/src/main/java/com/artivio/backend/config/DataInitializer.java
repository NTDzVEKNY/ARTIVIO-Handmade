package com.artivio.backend.config;

import com.artivio.backend.modules.auth.model.Role;
import com.artivio.backend.modules.auth.model.User;
import com.artivio.backend.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Chỉ tạo user nếu chưa tồn tại
        if (userRepository.findByEmail("customer@test.com").isEmpty()) {
            User customer = User.builder()
                    .name("Test Customer")
                    .email("customer@test.com")
                    // Hash mật khẩu "123456"
                    .password(passwordEncoder.encode("123456"))
                    .role(Role.CUSTOMER)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(customer);
            System.out.println(">>> Đã tạo user CUSTOMER test: customer@test.com / 123456");
        }

        if (userRepository.findByEmail("artisan@test.com").isEmpty()) {
            User admin = User.builder()
                    .name("Test Artisan")
                    .email("artisan@test.com")
                    // Hash mật khẩu "123456"
                    .password(passwordEncoder.encode("123456"))
                    .role(Role.ADMIN)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(admin);
            System.out.println(">>> Đã tạo user ARTISAN test: artisan@test.com / 123456");
        }
    }
}