package com.artivio.backend.modules.order.mapper;

import com.artivio.backend.modules.order.dto.OrderRequestDTO;
import com.artivio.backend.modules.order.model.Chat;
import com.artivio.backend.modules.order.model.Order;
import com.artivio.backend.modules.order.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class OrderMapper {
    public Order toEntity(OrderRequestDTO dto) {
        Order order = new Order();

        if (dto.getCustomerId() != null) {
            User customer = new User();
            customer.setId(dto.getCustomerId());
            order.setCustomer(customer);
        }

        order.setArtisanId(dto.getArtisanId());

        if (dto.getChatId() != null) {
            Chat chat = Chat.builder().id(dto.getChatId()).build();
            order.setChat(chat);
        }

        order.setCreatedAt(LocalDateTime.now());
        order.setStatus("PENDING");

        return order;
    }
}
