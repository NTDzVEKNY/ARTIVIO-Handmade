package com.artivio.backend.modules.product.mapper;

import com.artivio.backend.modules.product.dto.ProductDTO;
import com.artivio.backend.modules.product.dto.ProductRequestDTO;
import com.artivio.backend.modules.product.dto.response.ProductDetailResponse;
import com.artivio.backend.modules.product.model.Category;
import com.artivio.backend.modules.product.model.Product;
import org.springframework.stereotype.Component;
import com.artivio.backend.modules.product.model.enums.EnumStatus;

@Component
public class ProductMapper {
    public Product toEntity(ProductRequestDTO dto, Category category) {
        return Product.builder()
                .productName(dto.getProductName())
                .price(dto.getPrice())
                .stockQuantity(dto.getStockQuantity())
                .image(dto.getImage())
                .status(dto.getStatus() != null ? dto.getStatus() : EnumStatus.ACTIVE)
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
                .categoryId(product.getCategory() != null ? product.getCategory().getCategoryId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getCategoryName() : null)
                .build();
    }

    public ProductDetailResponse toDetailResponse(Product product) {
        ProductDetailResponse dto = new ProductDetailResponse();
        dto.setId(product.getId());
        dto.setName(product.getProductName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setImage(product.getImage());
        dto.setStockQuantity(product.getStockQuantity());

        if (product.getCategory() != null) {
            dto.setCategoryName(product.getCategory().getCategoryName());
        }
        dto.setOutOfStock(product.getStockQuantity() <= 0);
        dto.setMaterial("Đang cập nhật");

        return dto;
    }
}
