package com.artivio.backend.modules.product.controller;

import com.artivio.backend.modules.product.dto.request.SubscribeRequest;
import com.artivio.backend.modules.product.dto.response.ProductDetailResponse;
import com.artivio.backend.modules.product.dto.response.ProductResponseDto;
import com.artivio.backend.modules.product.service.ProductDetailService;
import com.artivio.backend.modules.product.service.HandmadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductDetailController {

    @Autowired
    private ProductDetailService productDetailService;

    @Autowired
    private HandmadeService handmadeService;

    // 1. API Lấy chi tiết sản phẩm
    // GET /api/products/{id}
    // Optional query parameter ?admin=true to get product regardless of status and return ProductResponseDto
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductDetail(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "false") boolean admin) {
        if (admin) {
            // For admin: return ProductResponseDto with all fields, regardless of status
            ProductResponseDto response = handmadeService.getProductById(id);
            return ResponseEntity.ok(response);
        } else {
            // For public: only return ACTIVE products as ProductDetailResponse
            ProductDetailResponse response = productDetailService.getProductDetail(id);
            return ResponseEntity.ok(response);
        }
    }

    // 2. API Đăng ký nhận tin khi có hàng (Luồng phụ)
    // POST /api/products/{id}/subscribe
    @PostMapping("/{id}/subscribe")
    public ResponseEntity<String> subscribeToProduct(@PathVariable Long id, @RequestBody SubscribeRequest request) {
        productDetailService.subscribeProduct(id, request);
        return ResponseEntity.ok("Đăng ký nhận thông báo thành công.");
    }
}