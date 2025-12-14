package com.artivio.backend.modules.product.service;

import com.artivio.backend.modules.product.dto.request.SubscribeRequest;
import com.artivio.backend.modules.product.dto.response.ProductDetailResponse;
import com.artivio.backend.modules.product.mapper.ProductMapper;
import com.artivio.backend.modules.product.model.Product;
import com.artivio.backend.modules.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityNotFoundException;
import com.artivio.backend.modules.product.model.enums.EnumStatus;

@Service
public class ProductDetailService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductMapper productMapper;

    public ProductDetailResponse getProductDetail(Long id) {
        Product product = productRepository.findByIdAndStatus(id, EnumStatus.ACTIVE)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại hoặc đã bị ẩn"));

        return productMapper.toDetailResponse(product);
    }

    //Comming Soon
    public void subscribeProduct(Long productId, SubscribeRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tìm thấy"));

        // Logic lưu vào bảng subscriptions (giả định chưa có bảng này)
        // subscriptionRepository.save(new Subscription(productId, request.getEmail()));
        System.out.println("Đã đăng ký nhận tin cho email: " + request.getEmail() + " tại sản phẩm: " + productId);
    }
}