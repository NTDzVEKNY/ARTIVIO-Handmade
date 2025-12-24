package com.artivio.backend.modules.order.controller;


import com.artivio.backend.modules.order.dto.OrderRequestDTO;
import com.artivio.backend.modules.order.model.Order;
import com.artivio.backend.modules.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import com.artivio.backend.modules.order.dto.OrderProgressResponseDTO;
import com.artivio.backend.modules.order.dto.OrderDetailDTO;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create") // Hoặc đường dẫn bạn muốn
    public ResponseEntity<?> createOrder(
            @Valid @RequestBody OrderRequestDTO orderRequest,
            BindingResult result // Thêm cái này để hứng lỗi validate
    ) {
        // 1. Kiểm tra lỗi Validate (SĐT sai, thiếu tên...)
        if (result.hasErrors()) {
            // Gom tất cả lỗi lại thành 1 map để trả về cho Frontend dễ hiển thị
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : result.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            // Trả về lỗi 400 kèm danh sách lỗi chi tiết
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            Order newOrder = orderService.createOrder(orderRequest);
            return ResponseEntity.ok(newOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo đơn hàng: " + e.getMessage());
        }
    }

    // 2. Lấy chi tiết đơn hàng (GET)
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        try {
            OrderDetailDTO order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // 3. API Hủy đơn hàng (Khuyên dùng thay vì Delete)
    // Method: PUT /api/orders/{id}/cancel
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            Order order = orderService.cancelOrder(id);
            return ResponseEntity.ok("Đã hủy đơn hàng thành công. Trạng thái: " + order.getStatus());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. API Cập nhật trạng thái (Dành cho Admin/Shipper)
    // Method: PUT /api/orders/{id}/status?status=SHIPPED
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Order order = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API Xóa vĩnh viễn (Hard Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrderPermanently(@PathVariable Long id) {
        try {
            // Gọi qua Service
            orderService.deleteOrderPermanently(id);
            return ResponseEntity.ok("Đã xóa đơn hàng và chi tiết liên quan.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage()); // Trả về 404 nếu không tìm thấy
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa: " + e.getMessage());
        }
    }

    // THEO DÕI TIẾN ĐỘ (Custom Orders)
    @GetMapping("/custom-progress")
    public ResponseEntity<List<OrderProgressResponseDTO>> getCustomOrderProgress(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Lấy email từ token (vì trong SecurityConfig setup load user theo email)
        String email = userDetails.getUsername();

        // Truyền email thay vì ID
        List<OrderProgressResponseDTO> result = orderService.getCustomOrdersProgress(email);
        return ResponseEntity.ok(result);
    }

    // LẤY TẤT CẢ ĐƠN HÀNG CỦA TÔI
    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderProgressResponseDTO>> getAllMyOrders(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Lấy email từ token (vì trong SecurityConfig setup load user theo email)
        String email = userDetails.getUsername();

        // Truyền email xuống Service
        return ResponseEntity.ok(orderService.getAllMyOrders(email));
    }
}
