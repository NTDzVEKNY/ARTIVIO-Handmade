package com.artivio.backend.modules.auth.repository;

import com.artivio.backend.modules.auth.model.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.artivio.backend.modules.auth.model.User;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByEmail(String email);
}