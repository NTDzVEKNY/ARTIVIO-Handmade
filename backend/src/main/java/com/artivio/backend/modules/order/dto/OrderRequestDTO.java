package com.artivio.backend.modules.order.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequestDTO {
    private Long customerId;
    private Long artisanId;
    private Long chatId;
    private List<OrderItemRequestDTO> items;
}