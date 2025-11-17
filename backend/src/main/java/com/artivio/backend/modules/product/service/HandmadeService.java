package com.artivio.backend.modules.product.service;


import com.artivio.backend.modules.product.dto.CategoryDTO;
import com.artivio.backend.modules.product.dto.ProductDTO;
import com.artivio.backend.modules.product.dto.ProductRequestDTO;
import com.artivio.backend.modules.product.mapper.CategoryMapper;
import com.artivio.backend.modules.product.mapper.ProductMapper;
import com.artivio.backend.modules.product.model.Category;
import com.artivio.backend.modules.product.model.Product;
import com.artivio.backend.modules.product.repository.CategoryRepository;
import com.artivio.backend.modules.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
    // Get one
    public ProductDTO getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return productMapper.toDTO(product);
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
        product.setStatus(req.getStatus());
        product.setDescription(req.getDescription());
        product.setCategory(category);

        Product updated = productRepository.save(product);
        return productMapper.toDTO(updated);
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
}
