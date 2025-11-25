package com.artivio.backend.modules.auth.dto.response;

import com.artivio.backend.modules.auth.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class RegisterResponse {
    private int id;
    private String username;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
}
