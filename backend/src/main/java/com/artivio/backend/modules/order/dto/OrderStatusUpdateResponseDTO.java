package com.artivio.backend.modules.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateResponseDTO {
    private Long id;
    private String status;
    private String message;
}



