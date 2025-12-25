package com.artivio.backend.modules.product.dto.request;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductFilterDto {
    private Long categoryId;

    // Từ khóa tìm kiếm (searchQuery)
    private String keyword;

    // Mặc định là 'featured' nếu null
    private String sort = "featured"; // featured, price-asc, price-desc, name-asc, name-desc

    // Phân trang: Mặc định page 0, size 20
    private int page = 0;
    private int size = 20;

    // Price Range: Mặc định là all (ko lọc)
    private Double minPrice;
    private Double maxPrice;

    // Admin flag: if true, returns all products regardless of status
    private Boolean admin = false;

    // Getter tiện ích để lấy keyword sạch
    public String getKeyword() {
        return (keyword != null) ? keyword.trim() : null;
    }
}