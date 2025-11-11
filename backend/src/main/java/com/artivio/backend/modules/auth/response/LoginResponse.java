package com.artivio.backend.modules.auth.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private int userId;
    private String username;
    private String message;
}
