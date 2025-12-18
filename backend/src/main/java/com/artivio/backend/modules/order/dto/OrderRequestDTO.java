package com.artivio.backend.modules.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class OrderRequestDTO {
    private Long customerId;
    private Long artisanId = 1L;
    private Long chatId;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng số 0)")
    private String phoneNumber;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    @Size(min = 10, message = "Địa chỉ phải chi tiết hơn (tối thiểu 10 ký tự)")
    private String address;

    @Size(max = 200, message = "Ghi chú tối đa 200 ký tự")
    private String note;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod; // "COD" hoặc "ONLINE"

    // --- GIỎ HÀNG ---
    @NotEmpty(message = "Giỏ hàng không được để trống")
    @Valid
    private List<OrderItemRequestDTO> items;
}