package com.artivio.backend.modules.product.dto.response;

import lombok.Data;

import java.util.List;


@Data
public class PaginatedResponseDto<T>{
    // Danh sách dữ liệu (List<ProductResponseDto>)
    private List<T> content;

    private long totalElements;

    private int totalPages;

    private int currentPage;

    private int size;

    // Constructor tính toán logic phân trang
    public PaginatedResponseDto(List<T> content, int page, int size, long totalElements) {
        this.content = content;
        this.currentPage = page;
        this.size = size;
        this.totalElements = totalElements;

        if (size > 0) {
            this.totalPages = (int) Math.ceil((double) totalElements / size);
        } else {
            this.totalPages = (totalElements > 0) ? 1 : 0;
        }
    }
}