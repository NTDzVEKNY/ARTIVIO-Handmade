package com.artivio.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Frontend sẽ kết nối vào: http://localhost:8080/ws
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Cho phép mọi nguồn (CORS), nên cấu hình kỹ hơn khi lên Prod
                .withSockJS(); // Hỗ trợ fallback nếu trình duyệt không có WebSocket

        // 2. Endpoint dành riêng cho Postman/Mobile App (Raw WebSocket)
        registry.addEndpoint("/ws-raw")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefix cho các message từ Client gửi lên Server
        // Ví dụ: Client gửi tới "/app/chat.sendMessage"
        registry.setApplicationDestinationPrefixes("/app");

        // Prefix cho các message từ Server gửi xuống Client (Subscribe)
        // Ví dụ: Client lắng nghe tại "/topic/chat/1"
        registry.enableSimpleBroker("/topic", "/queue");
    }
}