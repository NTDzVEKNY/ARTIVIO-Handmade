package com.artivio.backend.modules.product.controller;

import com.artivio.backend.modules.product.dto.request.SubscribeRequest;
import com.artivio.backend.modules.product.dto.response.ProductDetailResponse;
import com.artivio.backend.modules.product.service.ProductDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductDetailController {

    @Autowired
    private ProductDetailService productDetailService;

    // 1. API Lấy chi tiết sản phẩm
    // GET /api/products/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> getProductDetail(@PathVariable Long id) {
        ProductDetailResponse response = productDetailService.getProductDetail(id);
        return ResponseEntity.ok(response);
    }

    // 2. API Đăng ký nhận tin khi có hàng (Luồng phụ)
    // POST /api/products/{id}/subscribe
    @PostMapping("/{id}/subscribe")
    public ResponseEntity<String> subscribeToProduct(@PathVariable Long id, @RequestBody SubscribeRequest request) {
        productDetailService.subscribeProduct(id, request);
        return ResponseEntity.ok("Đăng ký nhận thông báo thành công.");
    }
}