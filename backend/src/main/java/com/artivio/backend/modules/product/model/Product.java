package com.artivio.backend.modules.product.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}
