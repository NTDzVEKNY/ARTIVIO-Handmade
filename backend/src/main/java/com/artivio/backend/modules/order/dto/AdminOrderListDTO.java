package com.artivio.backend.modules.order.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AdminOrderListDTO {
    private Long id;
    private String orderNumber; // Format: ART-{id}
    private String customerName;
    private String phone;
    private String status;
    private LocalDateTime createdAt;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal total;
    private String paymentMethod;
    private String shippingAddress;
    private String note;
    private List<OrderItemDTO> items;

    @Data
    @Builder
    public static class OrderItemDTO {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal price;
        private String image;
    }
}

