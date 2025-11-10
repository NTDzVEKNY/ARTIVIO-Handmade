package com.artivio.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
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

    public Product() {
    }

    public Product(Long id, String productName, String price, Integer quantitySold, Integer stockQuantity, String image, String status, String description, Integer categoryId) {
        this.id = id;
        this.productName = productName;
        this.price = price;
        this.quantitySold = quantitySold;
        this.stockQuantity = stockQuantity;
        this.image = image;
        this.status = status;
        this.description = description;
        this.categoryId = categoryId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public Integer getQuantitySold() {
        return quantitySold;
    }

    public void setQuantitySold(Integer quantitySold) {
        this.quantitySold = quantitySold;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }
}
