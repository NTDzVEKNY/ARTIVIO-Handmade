package com.artivio.backend.modules.auth.service;

import lombok.RequiredArgsConstructor;
import com.artivio.backend.modules.auth.dto.response.RegisterResponse;
import com.artivio.backend.modules.auth.model.Otp;
import com.artivio.backend.modules.auth.repository.UserRepository;
import com.artivio.backend.modules.auth.repository.OtpRepository;
import com.artivio.backend.utils.EmailService.EmailService;
import com.artivio.backend.modules.auth.dto.request.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class RegisterService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final OtpRepository otpRepository;

    public String register(RegisterRequest req) {

        // Check email duplicate
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new RuntimeException("Password và Confirm Password phải giống nhau");
        }

        Otp otp = new Otp();
        otp.setName(req.getName());
        otp.setEmail(req.getEmail());
        otp.setPassword(passwordEncoder.encode(req.getPassword()));
        otp.setCode(String.valueOf(new Random().nextInt(900000) + 100000));
        otp.setExpiresAt(java.time.LocalDateTime.now().plusMinutes(5));

        otpRepository.save(otp);

        emailService.sendOtpEmail(req.getEmail(), otp.getCode());

        return "OTP đã được gửi đến email của bạn.";
    }
}
