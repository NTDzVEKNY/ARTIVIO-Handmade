package com.artivio.backend.modules.product.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductRequestDTO {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String productName;

    @NotBlank(message = "Giá sản phẩm không được để trống")
    private Double price;

    @NotNull(message = "Số lượng tồn kho không được để trống")
    @Min(value = 0, message = "Số lượng tồn kho phải >= 0")
    private Integer stockQuantity;
    @Min(value = 0)
    private Integer quantitySold;   // có thể null (lúc tạo mới = 0)

    private String image;

    @NotBlank(message = "Trạng thái không được để trống")
    private String status;

    private String description;

    @NotNull(message = "Category ID không được để trống")
    private Long categoryId;
}
