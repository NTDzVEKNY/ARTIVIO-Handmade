package com.artivio.backend.modules.product.mapper;

import com.artivio.backend.modules.product.dto.ProductDTO;
import com.artivio.backend.modules.product.dto.request.ProductRequestDTO;
import com.artivio.backend.modules.product.model.Category;
import com.artivio.backend.modules.product.model.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {
    public Product toEntity(ProductRequestDTO dto, Category category) {
        return Product.builder()
                .productName(dto.getProductName())
                .price(dto.getPrice())
                .stockQuantity(dto.getStockQuantity())
                .image(dto.getImage())
                .status(dto.getStatus())
                .description(dto.getDescription())
                .quantitySold(0)
                .category(category)
                .build();
    }

    public ProductDTO toDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .quantitySold(product.getQuantitySold())
                .image(product.getImage())
                .status(product.getStatus())
                .description(product.getDescription())
                .categoryId(product.getCategory().getCategoryId())
                .categoryName(product.getCategory().getCategoryName())
                .build();
    }
}
