package com.artivio.backend.modules.product.service;


import com.artivio.backend.modules.product.dto.CategoryDTO;
import com.artivio.backend.modules.product.dto.ProductDTO;
import com.artivio.backend.modules.product.dto.request.ProductRequestDTO;
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
import com.artivio.backend.modules.product.dto.request.ProductFilterDto;
import com.artivio.backend.modules.product.dto.response.PagedResponse;
import com.artivio.backend.modules.product.dto.response.PaginatedResponseDto;
import com.artivio.backend.modules.product.dto.response.ProductResponseDto;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.util.List;
import java.util.stream.Collectors;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class HandmadeService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    // Lấy danh sách danh mục
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAllWithTotalSold();
    }

    // Get product by ID (for admin - returns product regardless of status)
    public ProductResponseDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return productMapper.toResponseDto(product);
    }

    // Lấy danh sách sản phẩm
    public PaginatedResponseDto<ProductResponseDto> getAllProducts(ProductFilterDto filterDto) {
        // 1. Xử lý Sort
        Sort sort = buildSort(filterDto.getSort());

        // 2. Tạo Pageable từ page, size và sort
        Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize(), sort);

        // 3. Tạo Specification từ điều kiện lọc
        Specification<Product> spec = buildSpecification(filterDto);

        // 4. Gọi Repository với Spec và Pageable
        // Lưu ý: Repository phải extend JpaSpecificationExecutor<Product>
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        // 5. Map sang DTO
        List<ProductResponseDto> content = productPage.getContent().stream()
                .map(product -> {
                    ProductResponseDto dto = productMapper.toResponseDto(product);
                    // QUAN TRỌNG: Lấy tên category.
                    // Nếu Entity Product đã map @ManyToOne với Category thì:
                    if (product.getCategory() != null) {
                        dto.setCategoryName(product.getCategory().getCategoryName());
                    } else {
                        dto.setCategoryName("N/A");
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        // 6. Trả về kết quả
        return new PaginatedResponseDto<>(
                content,
                filterDto.getPage(),
                filterDto.getSize(),
                productPage.getTotalElements()
        );
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

    private Specification<Product> buildSpecification(ProductFilterDto filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Lọc theo Category ID (nếu có)
            if (filter.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), filter.getCategoryId()));
            }

            // 2. Lọc theo từ khóa tìm kiếm (theo tên, không phân biệt hoa thường)
            if (filter.getKeyword() != null && !filter.getKeyword().isEmpty()) {
                String likePattern = "%" + filter.getKeyword().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("productName")), likePattern));
            }

            // 3. Lọc theo khoảng giá min price và max price(nếu có)
            if (filter.getMinPrice() != null && filter.getMaxPrice() != null) {
                predicates.add(cb.between(root.get("price"), filter.getMinPrice(), filter.getMaxPrice()));
            }
            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice()));
            }
            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice()));
            }

            // 4. Đảm bảo status là ACTIVE (chỉ khi không phải admin)
            // Admin có thể xem tất cả sản phẩm (ACTIVE và HIDDEN)
            if (filter.getAdmin() == null || !filter.getAdmin()) {
                predicates.add(cb.equal(root.get("status"), "ACTIVE"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort buildSort(String sortParam) {
        if (sortParam == null) return Sort.by("quantitySold").descending(); // Default: Featured

        return switch (sortParam) {
            case "price-asc" -> Sort.by("price").ascending();
            case "price-desc" -> Sort.by("price").descending();
            case "name-asc" -> Sort.by("name").ascending();
            case "name-desc" -> Sort.by("name").descending();
            case "featured" -> Sort.by("quantitySold").descending();
            default -> Sort.by("quantitySold").descending();
        };
    }
}
