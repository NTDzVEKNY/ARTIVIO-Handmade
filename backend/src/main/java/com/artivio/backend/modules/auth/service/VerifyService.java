package com.artivio.backend.modules.auth.service;

import com.artivio.backend.modules.auth.dto.request.VerifyAccountRequest;
import com.artivio.backend.modules.auth.model.Otp;
import com.artivio.backend.modules.auth.model.User;
import com.artivio.backend.modules.auth.model.Role;
import com.artivio.backend.modules.auth.repository.OtpRepository;
import com.artivio.backend.modules.auth.repository.UserRepository;
import com.artivio.backend.utils.EmailService.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VerifyService {
    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public String verifyAccount(VerifyAccountRequest request) {
        Otp otp = otpRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Mail chưa được đăng ký!"));

        if (otp.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            otpRepository.delete(otp);
            throw new RuntimeException("Mã xác thực đã hết hạn!");
        }

        if (!otp.getCode().equals(request.getCode())) {
            throw new RuntimeException("Mã xác thực không hợp lệ!");
        }

        otpRepository.delete(otp);
        emailService.sendEmail(request.getEmail(), "Artivio - Xác thực thành công", "Xác thực thành công người dùng" + otp.getName());

        User user = new User();
        user.setName(otp.getName());
        user.setEmail(otp.getEmail());
        user.setPassword(otp.getPassword());
        user.setRole(Role.USER);

        userRepository.save(user);

        return "Xác thực thành công! Tài khoản của bạn đã được tạo.";
    }
}