package com.artivio.backend.modules.auth.service;

import com.artivio.backend.modules.auth.model.Role;
import com.artivio.backend.modules.auth.model.User;
import com.artivio.backend.modules.auth.repository.UserRepository;
import com.artivio.backend.modules.auth.request.RegisterRequest;
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
        user.setPassword(request.getPassword());
        user.setRole(Role.USER);

        return userRepository.save(user);
    }
}
