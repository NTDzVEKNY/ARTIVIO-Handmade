package com.artivio.backend.modules.product.service;


import com.artivio.backend.modules.product.dto.CategoryDTO;
import com.artivio.backend.modules.product.dto.ProductDTO;
import com.artivio.backend.modules.product.dto.request.ProductRequestDTO;
import com.artivio.backend.modules.product.mapper.CategoryMapper;
import com.artivio.backend.modules.product.mapper.ProductMapper;
import com.artivio.backend.modules.product.model.Category;
import com.artivio.backend.modules.product.model.Product;
import com.artivio.backend.modules.product.repository.CategoryRepository;
import com.artivio.backend.modules.product.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.artivio.backend.modules.product.model.enums.EnumStatus;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HandmadeService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    // lay category
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryMapper::toDTO)
                .collect(Collectors.toList());
    }
    // Create product
    public ProductDTO create(ProductRequestDTO req) {
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = productMapper.toEntity(req, category);
        Product saved = productRepository.save(product);

        return productMapper.toDTO(saved);
    }

    // Update
    public ProductDTO update(Long id, ProductRequestDTO req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setProductName(req.getProductName());
        product.setPrice(req.getPrice());
        product.setStockQuantity(req.getStockQuantity());
        product.setImage(req.getImage());
        product.setDescription(req.getDescription());
        product.setCategory(category);
        if (req.getStatus() != null) {
            product.setStatus(req.getStatus());
        }
        Product updated = productRepository.save(product);
        return productMapper.toDTO(updated);
    }

    // Soft delete (Ẩn đi thay vì xóa thật)
    public void softDelete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStatus(EnumStatus.HIDDEN);
        productRepository.save(product);
    }

    // Delete
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        productRepository.deleteById(id);
    }

    public Page<ProductDTO> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findAll(pageable);

        return products.map(productMapper::toDTO);
    }

    public Page<ProductDTO> getProductsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findByCategory_CategoryId(categoryId, pageable);

        return products.map(productMapper::toDTO);
    }

    // Hàm này vừa check tồn kho vừa trừ kho luôn
    @Transactional
    public Product decreaseStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + productId));

        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Sản phẩm " + product.getProductName() + " không đủ số lượng tồn kho!");
        }

        // Trừ kho
        product.setStockQuantity(product.getStockQuantity() - quantity);

        // Tăng số lượng đã bán
        int currentSold = product.getQuantitySold() == null ? 0 : product.getQuantitySold();
        product.setQuantitySold(currentSold + quantity);

        return productRepository.save(product);
    }

}
