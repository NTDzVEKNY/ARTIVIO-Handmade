package com.artivio.backend.modules.product.mapper;

import com.artivio.backend.modules.product.dto.CategoryDTO;
import com.artivio.backend.modules.product.model.Category;

public class CategoryMapper {
    public static CategoryDTO toDTO(Category category) {
        return new CategoryDTO(
                category.getCategoryId(),
                category.getCategoryName()
        );
    }
}
