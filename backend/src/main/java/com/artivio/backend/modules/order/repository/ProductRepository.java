package com.artivio.backend.modules.order.repository;

import com.artivio.backend.modules.order.model.Product;
import com.artivio.backend.modules.order.model.EnumStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("orderProductRepository")
public interface ProductRepository extends JpaRepository<Product,Long> {
    Page<Product> findByCategory_CategoryId(Long categoryId, Pageable pageable);
    Optional<Product> findByIdAndStatus(Long id, EnumStatus status);
}
