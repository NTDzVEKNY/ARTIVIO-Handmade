package com.artivio.backend.modules.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderItemRequestDTO {
    @NotNull(message = "ID sản phẩm không được để trống")
    private Long productId;
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;
}
