package com.artivio.backend.modules.product.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.artivio.backend.modules.product.model.enums.EnumStatus;


@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "artisan_id")
    private Long artisan_id;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "name")
    private String productName;

    @Column(name = "price")
    private Double price;

    @Column(name = "quantity_sold")
    private Integer quantitySold;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "image")
    private String image;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private EnumStatus status;
    
    @Column(name = "description")
    private String description;

}
