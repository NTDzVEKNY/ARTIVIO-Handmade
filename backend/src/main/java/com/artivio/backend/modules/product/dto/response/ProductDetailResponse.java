package com.artivio.backend.modules.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String image;
    private Integer stockQuantity;
    private Integer quantitySold;
    private String categoryName;
    private String material; // Field này FE yêu cầu (dù DB chưa có)
    private boolean isOutOfStock; // Cờ để FE hiển thị giao diện Hết hàng
}