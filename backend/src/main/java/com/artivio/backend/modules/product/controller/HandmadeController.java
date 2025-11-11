package com.artivio.backend.modules.product.controller;

import com.artivio.backend.modules.product.model.Category;
import com.artivio.backend.modules.product.model.Product;
import com.artivio.backend.modules.product.response.PagedResponse;
import com.artivio.backend.modules.product.service.HandmadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/category/{id}/products")
    public ResponseEntity<PagedResponse<Product>> getProductsByCategory(
            @PathVariable int id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ){
        Page<Product> products = handmadeService.getProductsByCategory(id, page, size);
        PagedResponse<Product> response = new PagedResponse<>(products);
        return ResponseEntity.ok(response);
    }
    // Create product
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Product product){
        Product saved = handmadeService.createProduct(product);
        return ResponseEntity.ok(saved);
    }
    // Read one product
    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id){
        return ResponseEntity.ok(handmadeService.getProductById(id));
    }
    // Update product
    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product
    ){
        return ResponseEntity.ok(handmadeService.updateProduct(id, product));
    }
    // Delete
    @DeleteMapping("/products/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id){
        handmadeService.deleteProduct(id);
        return ResponseEntity.ok("Deleted product: " + id);
    }
}
