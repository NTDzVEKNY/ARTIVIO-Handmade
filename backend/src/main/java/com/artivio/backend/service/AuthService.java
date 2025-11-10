package com.artivio.backend.service;

import com.artivio.backend.model.Role;
import com.artivio.backend.model.User;
import com.artivio.backend.model.request.LoginRequest;
import com.artivio.backend.model.request.RegisterRequest;
import com.artivio.backend.repository.UserRepository;
import com.artivio.backend.response.LoginResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    public User register(RegisterRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // sau này mã hóa BCrypt
        user.setRole(Role.USER);

        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request){
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(!user.getPassword().equals(request.getPassword())){
            throw new RuntimeException("Wrong password");
        }

        return new LoginResponse(
                user.getId(),
                user.getUsername(),
                "Login success"
        );
    }
}
