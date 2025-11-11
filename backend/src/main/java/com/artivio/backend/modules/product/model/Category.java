package com.artivio.backend.modules.product.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "category")
@Data
public class Category {
    @Id
    @Column(name = "category_id")
    private int id;
    @Column(name = "category_name")
    private String categoryName;
}
