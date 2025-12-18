package com.artivio.backend.modules.order.mapper;

import com.artivio.backend.modules.order.dto.OrderRequestDTO;
import com.artivio.backend.modules.order.dto.OrderProgressResponseDTO;
import com.artivio.backend.modules.order.model.Chat;
import com.artivio.backend.modules.order.model.Order;
import com.artivio.backend.modules.order.model.User;
import com.artivio.backend.modules.order.repository.UserRepository;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {
    private final UserRepository userRepository;

    @Autowired
    public OrderMapper(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Order toEntity(OrderRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        Order order = new Order();

        if (dto.getCustomerId() != null) {
            User customer = userRepository.findById(dto.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + dto.getCustomerId()));
            order.setCustomer(customer);
        }

        order.setArtisanId(dto.getArtisanId());

        order.setPhoneNumber(dto.getPhoneNumber());
        order.setAddress(dto.getAddress());
        order.setNote(dto.getNote());


        if (dto.getChatId() != null) {
            Chat chat = Chat.builder().id(dto.getChatId()).build();
            order.setChat(chat);
        }

        order.setCreatedAt(LocalDateTime.now());
        order.setStatus("PENDING"); // Mặc định trạng thái mới
        return order;
    }

    public OrderProgressResponseDTO mapToDTO(Order order) {
        List<OrderProgressResponseDTO.OrderItemDTO> items = order.getOrderItems().stream()
                .map(item -> OrderProgressResponseDTO.OrderItemDTO.builder()
                        .productName(item.getProduct().getProductName())
                        .quantity(item.getQuantity())
                        .price(item.getPriceOrder())
                        .imageUrl(item.getProduct().getImage())
                        .build())
                .collect(Collectors.toList());

        return OrderProgressResponseDTO.builder()
                .id(order.getId())
                .status(order.getStatus())
                .orderDate(order.getCreatedAt())
                .totalPrice(order.getTotalPrice())
                .isCustomOrder(order.getChat() != null) // Logic xác định đơn đặt riêng
                .note(order.getNote())
                .items(items)
                .build();
    }
}
