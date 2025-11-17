package com.artivio.backend.modules.auth.dto;

import com.artivio.backend.modules.auth.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserResponse {
    private int id;
    private String username;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
}
