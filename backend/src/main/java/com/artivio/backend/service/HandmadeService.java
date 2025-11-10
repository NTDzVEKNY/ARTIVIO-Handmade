package com.artivio.backend.service;

import com.artivio.backend.model.Category;
import com.artivio.backend.model.Product;
import com.artivio.backend.repository.CategoryRepository;
import com.artivio.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HandmadeService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CategoryRepository categoryRepository;

    public Page<Product> getAllProducts(int page, int size) {
        return productRepository.findAll(PageRequest.of(page, size));
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

}
