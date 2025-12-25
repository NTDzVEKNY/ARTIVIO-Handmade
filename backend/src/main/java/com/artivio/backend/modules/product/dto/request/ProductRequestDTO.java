package com.artivio.backend.modules.product.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.artivio.backend.modules.product.model.enums.EnumStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductRequestDTO {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String productName;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @Min(value = 0, message = "Giá sản phẩm phải >= 0")
    private Double price;

    @NotNull(message = "Số lượng tồn kho không được để trống")
    @Min(value = 0, message = "Số lượng tồn kho phải >= 0")
    private Integer stockQuantity;

    @Min(value = 0, message = "Số lượng bán phải >= 0")
    private Integer quantitySold;

    private String image;

    @NotNull(message = "Trạng thái không được để trống")
    private EnumStatus status;

    private String description;

    @NotNull(message = "Category ID không được để trống")
    private Long categoryId;
}
