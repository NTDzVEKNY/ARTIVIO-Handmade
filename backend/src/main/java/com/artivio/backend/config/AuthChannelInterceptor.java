package com.artivio.backend.config;

import com.artivio.backend.security.JwtService; // 1. Import JwtService
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Thêm log để dễ debug
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j // Lombok log
@Component
@RequiredArgsConstructor
public class AuthChannelInterceptor implements ChannelInterceptor {

    // 2. Inject JwtService
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // Chỉ kiểm tra khi Client bắt đầu kết nối (CONNECT frame)
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {

            List<String> authHeaders = accessor.getNativeHeader("Authorization");

            if (authHeaders != null && !authHeaders.isEmpty()) {
                String token = authHeaders.get(0);

                if (token.startsWith("Bearer ")) {
                    token = token.substring(7);

                    try {
                        // 3. CODE THỰC TẾ: Trích xuất username từ Token
                        String username = jwtService.extractUsername(token);

                        if (username != null) {
                            // 4. Load user từ DB
                            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                            // 5. Kiểm tra Token có hợp lệ với User này không
                            if (jwtService.isTokenValid(token, userDetails)) {

                                // 6. Tạo Authentication object
                                UsernamePasswordAuthenticationToken authentication =
                                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                                // 7. Gán User vào Session của WebSocket
                                accessor.setUser(authentication);
                                log.info("WebSocket Authenticated User: {}", username);
                            }
                        }

                    } catch (Exception e) {
                        // Nếu token hết hạn hoặc sai định dạng, JwtService sẽ ném Exception
                        log.error("Lỗi xác thực WebSocket: {}", e.getMessage());
                        // Không làm gì cả, user sẽ null -> Connection sẽ bị từ chối hoặc coi là Anonymous
                    }
                }
            }
        }
        return message;
    }
}