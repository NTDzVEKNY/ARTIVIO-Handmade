package com.artivio.backend.modules.order.dto;

import com.artivio.backend.modules.order.model.OrderItem;
import com.artivio.backend.modules.order.model.Product;
import lombok.Data;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderDetailDTO {
    private Long id;
    private Long chatId;
    private String status;
    private BigDecimal totalPrice;
    private String paymentMethod;
    private String shippingAddress;
    private String customerName;
    private String customerPhone;
    private String note;
    private BigDecimal shippingFee;
    private LocalDateTime orderDate;
    private List<OrderItem> items;

    @Data
    @Builder
    public static class OrderItem {
        private Long id;
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal subtotal;
        private String productImage;
    }
}