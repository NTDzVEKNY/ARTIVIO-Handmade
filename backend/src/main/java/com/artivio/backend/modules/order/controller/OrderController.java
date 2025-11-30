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
}
