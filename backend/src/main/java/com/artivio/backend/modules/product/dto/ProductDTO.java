package com.artivio.backend.modules.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.artivio.backend.modules.product.model.enums.EnumStatus;

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
    private EnumStatus status;
    private String description;
    private Long categoryId;
    private String categoryName;
}
