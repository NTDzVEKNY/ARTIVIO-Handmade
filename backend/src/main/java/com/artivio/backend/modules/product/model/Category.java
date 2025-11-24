package com.artivio.backend.modules.product.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    @Column(name = "id")
    private Long categoryId;
    @Column(name = "name")
    private String categoryName;
    // Mối quan hệ 1-nhiều
    @OneToMany(mappedBy = "categories", cascade = CascadeType.ALL)
    private List<Product> products;
}
