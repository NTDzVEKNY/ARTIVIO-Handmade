package com.artivio.backend.modules.product.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDTO {
    private Long categoryId;
    private String categoryName;
    private String slug;
    private Long parentId;
    private String createdAt;
    private String updatedAt;
    private Long soldCount;

}
