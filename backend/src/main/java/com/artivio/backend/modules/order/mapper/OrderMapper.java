package com.artivio.backend.modules.order.mapper;

import com.artivio.backend.modules.order.dto.OrderRequestDTO;
import com.artivio.backend.modules.order.dto.OrderProgressResponseDTO;
import com.artivio.backend.modules.order.model.Chat;
import com.artivio.backend.modules.order.model.Order;
import com.artivio.backend.modules.order.model.User;
import com.artivio.backend.modules.order.repository.UserRepository;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import com.artivio.backend.modules.order.dto.OrderDetailDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

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

    public OrderDetailDTO mapToDetailDTO(Order order) {
        if (order == null) {
            return null;
        }

        // Map danh sách items
        // Lưu ý: item là Entity, OrderDetail.OrderItem là DTO
        List<OrderDetailDTO.OrderItem> items = order.getOrderItems().stream()
                .map(item -> OrderDetailDTO.OrderItem.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getProductName())
                        .quantity(item.getQuantity())
                        .price(item.getPriceOrder())
                        // Tính subtotal: giá * số lượng
                        .subtotal(item.getPriceOrder().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .productImage(item.getProduct().getImage())
                        .build())
                .collect(Collectors.toList());

        // Map Order chính
        return OrderDetailDTO.builder()
                .id(order.getId())
                .chatId(order.getChat() != null ? order.getChat().getId() : null)
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
                .paymentMethod(order.getPaymentMethod())
                .shippingAddress(order.getAddress())
                .customerName(order.getCustomer() != null ? order.getCustomer().getUsername() : "N/A")
                .customerPhone(order.getPhoneNumber())
                .note(order.getNote())
                .orderDate(order.getCreatedAt()) // Thường Entity sẽ có field createdAt
                .items(items)
                .build();
    }


}
