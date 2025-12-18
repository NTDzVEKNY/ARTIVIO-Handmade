package com.artivio.backend.modules.order.dto;

import com.artivio.backend.modules.order.model.EnumStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderProgressResponseDTO {
    private Long id;
    private String status;
    private LocalDateTime orderDate; // created_at
    private BigDecimal totalPrice;
    private boolean isCustomOrder;   // True nếu là hàng đặt riêng (có chat_id)
    private String note;

    // Danh sách sản phẩm trong đơn (rút gọn)
    private List<OrderItemDTO> items;

    @Data
    @Builder
    public static class OrderItemDTO {
        private String productName;
        private Integer quantity;
        private BigDecimal price;
        private String imageUrl;
    }
}