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
import org.springframework.transaction.annotation.Transactional;


import java.util.Random;

@Service
@RequiredArgsConstructor
public class RegisterService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final OtpRepository otpRepository;

    @Transactional
    public String register(RegisterRequest req) {

        // Check email duplicate
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new RuntimeException("Password và Confirm Password phải giống nhau");
        }

        Otp otp = otpRepository.findByEmail(req.getEmail()).orElse(null);
        if (otp != null) {
            otpRepository.delete(otp);
        }

        Otp newOtp = new Otp();
        newOtp.setName(req.getName());
        newOtp.setEmail(req.getEmail());
        newOtp.setPassword(passwordEncoder.encode(req.getPassword()));
        newOtp.setCode(String.valueOf(new Random().nextInt(900000) + 100000));
        newOtp.setExpiresAt(java.time.LocalDateTime.now().plusMinutes(5));

        otpRepository.save(newOtp);

        emailService.sendOtpEmail(req.getEmail(), newOtp.getCode());

        return "OTP đã được gửi đến email của bạn.";
    }
}
