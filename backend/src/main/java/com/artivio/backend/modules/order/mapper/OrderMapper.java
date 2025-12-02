package com.artivio.backend.modules.order.mapper;


import com.artivio.backend.modules.order.dto.OrderRequestDTO;
import com.artivio.backend.modules.order.model.Order;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class OrderMapper {

    public Order toEntity(OrderRequestDTO dto) {
        Order order = new Order();
        order.setCustomerId(dto.getCustomerId());
        order.setArtisanId(dto.getArtisanId());
        order.setChatId(dto.getChatId());
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus("PENDING"); // Mặc định trạng thái mới
        return order;
    }
}
