package com.artivio.backend.modules.product.controller;

import com.artivio.backend.modules.product.dto.CategoryDTO;
import com.artivio.backend.modules.product.dto.ProductDTO;
import com.artivio.backend.modules.product.dto.request.ProductRequestDTO;
import com.artivio.backend.modules.product.dto.response.PagedResponse;
import com.artivio.backend.modules.product.model.Category;
import com.artivio.backend.modules.product.model.Product;
import com.artivio.backend.modules.product.service.HandmadeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import com.artivio.backend.modules.product.dto.request.ProductFilterDto;
import com.artivio.backend.modules.product.dto.response.PaginatedResponseDto;
import com.artivio.backend.modules.product.dto.response.ProductResponseDto;

import java.util.List;

@RestController
@RequestMapping("api")
@RequiredArgsConstructor
public class HandmadeController {
    private final HandmadeService handmadeService;

    // GET ALL
    @GetMapping("/products")
    public ResponseEntity<PaginatedResponseDto<ProductResponseDto>> getProducts(
            @ModelAttribute ProductFilterDto filterDto
    ){
        PaginatedResponseDto<ProductResponseDto> response = handmadeService.getAllProducts(filterDto);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/category")
    public ResponseEntity<List<CategoryDTO>> getCategory() {
        return ResponseEntity.ok(handmadeService.getAllCategories());
    }

    @GetMapping("/category/{id}/products")
    public ResponseEntity<PagedResponse<ProductDTO>> getProductsByCategory(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ){
        Page<ProductDTO> products = handmadeService.getProductsByCategory(id, page, size);
        PagedResponse<ProductDTO> response = new PagedResponse<>(products);
        return ResponseEntity.ok(response);
    }

    // CREATE
    @PostMapping("/products")
    public ResponseEntity<ProductDTO> createProduct(
            @Valid @RequestBody ProductRequestDTO dto
    ) {
        return ResponseEntity.ok(handmadeService.create(dto));
    }

    // UPDATE
    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO dto
    ) {
        return ResponseEntity.ok(handmadeService.update(id, dto));
    }

    // DELETE
    @DeleteMapping("/products/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        handmadeService.delete(id);
        return ResponseEntity.ok("Deleted product id: " + id);
    }

}
