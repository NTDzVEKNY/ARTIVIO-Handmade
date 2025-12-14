package com.artivio.backend.modules.order.mapper;


import com.artivio.backend.modules.order.dto.OrderRequestDTO;
import com.artivio.backend.modules.order.model.Order;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class OrderMapper {

    public Order toEntity(OrderRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        Order order = new Order();
        order.setCustomerId(dto.getCustomerId());
        order.setArtisanId(dto.getArtisanId());
        order.setChatId(dto.getChatId());

        order.setFullName(dto.getFullName());
        order.setPhoneNumber(dto.getPhoneNumber());
        order.setAddress(dto.getAddress());
        order.setNote(dto.getNote());

        order.setCreatedAt(LocalDateTime.now());
        order.setStatus("PENDING"); // Mặc định trạng thái mới
        return order;
    }
}
