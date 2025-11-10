package com.artivio.backend.controller;

import com.artivio.backend.model.Category;
import com.artivio.backend.model.Product;
import com.artivio.backend.response.PagedResponse;
import com.artivio.backend.service.HandmadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("api/v1/artivio")
public class HandmadeController {
    @Autowired
    private HandmadeService handmadeService;

    @GetMapping("/products")
    public ResponseEntity<PagedResponse<Product>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ){
        Page<Product> products = handmadeService.getAllProducts(page, size);
        PagedResponse<Product> response = new PagedResponse<>(products);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category")
    public List<Category> getCategory(){
        return handmadeService.getAllCategories();
    }
}
