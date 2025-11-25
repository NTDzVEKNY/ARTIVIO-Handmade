package com.artivio.backend.modules.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {
    private Long id;
    private String productName;
    private Double price;
    private Integer quantitySold;
    private Integer stockQuantity;
    private String image;
    private String status;
    private String description;
    private Long categoryId;
    private String categoryName;
}
