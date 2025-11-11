package com.artivio.backend.modules.product.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @Column(name = "product_id")
    private Long id;
    @Column(name = "product_name")
    private String productName;
    @Column(name = "price")
    private String price;
    @Column(name = "quantity_sold")
    private Integer quantitySold;
    @Column(name = "stock_quantity")
    private Integer stockQuantity;
    @Column(name = "image")
    private String image;
    @Column(name = "status")
    private String status;
    @Column(name = "description")
    private String description;
    @Column(name = "category_id")
    private Integer categoryId;
}
