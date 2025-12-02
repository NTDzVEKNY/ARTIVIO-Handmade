package com.artivio.backend.modules.order.controller;


import com.artivio.backend.modules.order.dto.OrderRequestDTO;
import com.artivio.backend.modules.order.model.Order;
import com.artivio.backend.modules.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequestDTO orderRequest) {
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
            Order order = orderService.getOrderById(id);
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
}
