package com.artivio.backend.modules.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDto {
    private Long id;

    private String name;

    private Double price;

    private String image;

    private Integer quantitySold;

    private Integer stockQuantity;

    private Long categoryId;

    private String description;

    // --- QUAN TRỌNG: Field này ko có trong bảng Product,
    // phải lấy từ bảng Category ---
    private String categoryName;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}