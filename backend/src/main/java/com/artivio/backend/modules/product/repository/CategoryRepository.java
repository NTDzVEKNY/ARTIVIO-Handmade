package com.artivio.backend.modules.product.repository;

import com.artivio.backend.modules.product.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import com.artivio.backend.modules.product.dto.CategoryDTO;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category,Long> {
    @Query("SELECT new com.artivio.backend.modules.product.dto.CategoryDTO(" +
            "c.categoryId, c.categoryName, c.slug, c.parentId, c.createdAt, c.updatedAt, COALESCE(SUM(p.quantitySold), 0)) " + // sum trả ra mặc định là Long
            "FROM Category c " +
            "LEFT JOIN c.products p " +
            "GROUP BY c.categoryId, c.categoryName " +
            "ORDER BY SUM(p.quantitySold) DESC")
    List<CategoryDTO> findAllWithTotalSold();
}
