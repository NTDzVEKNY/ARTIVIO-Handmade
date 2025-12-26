package com.artivio.backend.modules.auth.service;

import com.artivio.backend.modules.auth.dto.request.ForgotPasswordRequestDTO;
import com.artivio.backend.modules.auth.dto.request.ResetPasswordRequestDTO;
import com.artivio.backend.modules.auth.model.Otp;
import com.artivio.backend.modules.auth.model.User;
import com.artivio.backend.modules.auth.repository.OtpRepository;
import com.artivio.backend.modules.auth.repository.UserRepository;
import com.artivio.backend.utils.EmailService.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.Instant;
import java.util.Date;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ForgotPasswordService {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    // Bước 1: Gửi OTP qua email
    @Transactional
    public String requestForgotPassword(ForgotPasswordRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Người dùng với email này không tồn tại"));

        Otp otp = otpRepository.findByEmail(request.getEmail()).orElse(null);
        if (otp != null) {
            otpRepository.delete(otp);
        }

        // Lưu hoặc cập nhật OTP vào database
        Otp newOtp = new Otp();
        newOtp.setName(user.getName());
        newOtp.setEmail(user.getEmail());
        newOtp.setCode(String.valueOf(new Random().nextInt(900000) + 100000));
        newOtp.setExpiresAt(java.time.LocalDateTime.now().plusMinutes(5));

        otpRepository.save(newOtp);

        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getName(), newOtp.getCode());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gửi email OTP");
        }

        return "Mã OTP đã được gửi đến email của bạn.";
    }

    // Bước 2: Xác thực OTP và đổi mật khẩu
    @Transactional
    public String resetPassword(ResetPasswordRequestDTO request) {
        Otp otp = otpRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("OTP không hợp lệ"));

        if (otp.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            otp.setCode(String.valueOf(new Random().nextInt(900000) + 100000));
            otp.setExpiresAt(java.time.LocalDateTime.now().plusMinutes(5));
            emailService.sendVerificationEmail(otp.getEmail(), otp.getName(), otp.getCode());

            otpRepository.save(otp);

            throw new RuntimeException("Mã xác thực đã hết hạn! Chúng tôi đã gửi cho bạn mã mới!");
        }

        if (!otp.getCode().equals(request.getCode())) {
            throw new RuntimeException("Mã xác thực không hợp lệ!");
        }

        // Cập nhật mật khẩu mới (đã mã hóa)
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        emailService.sendResetPasswordSuccessEmail(otp.getEmail(), otp.getName());

        userRepository.save(user);
        otpRepository.delete(otp);

        return "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ.";
    }
}