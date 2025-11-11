package com.artivio.backend.modules.product.service;


import com.artivio.backend.modules.product.model.Category;
import com.artivio.backend.modules.product.model.Product;
import com.artivio.backend.modules.product.repository.CategoryRepository;
import com.artivio.backend.modules.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HandmadeService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CategoryRepository categoryRepository;

    // lay all products
    public Page<Product> getAllProducts(int page, int size) {
        return productRepository.findAll(PageRequest.of(page, size));
    }
    // lay category
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    // lay product theo category
    public Page<Product> getProductsByCategory(int categoryId, int page, int size){
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findByCategoryId(categoryId, pageable);
    }

    // create product
    public Product createProduct(Product product){
        return productRepository.save(product);
    }
    // get product
    public Product getProductById(Long id){
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
    // update product
    public Product updateProduct(Long id, Product newData){
        Product existing = getProductById(id);

        existing.setProductName(newData.getProductName());
        existing.setPrice(newData.getPrice());
        existing.setQuantitySold(newData.getQuantitySold());
        existing.setStockQuantity(newData.getStockQuantity());
        existing.setImage(newData.getImage());
        existing.setStatus(newData.getStatus());
        existing.setDescription(newData.getDescription());
        existing.setCategoryId(newData.getCategoryId());

        return productRepository.save(existing);
    }
    // delete product
    public void deleteProduct(Long id){
        if(!productRepository.existsById(id)){
            throw new RuntimeException("Product not found");
        }
        productRepository.deleteById(id);
    }
}
