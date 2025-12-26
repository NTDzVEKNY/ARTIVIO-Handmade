package com.artivio.backend.modules.order.model;

import com.artivio.backend.modules.order.model.Product;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@ToString
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @ToString.Exclude
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = true)
    @JsonIgnore
    private Product product;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "product_name")
    private String productName;

    // Giá tại thời điểm mua (không đổi dù giá product sau này có đổi)
    @Column(name = "price_order")
    private BigDecimal priceOrder;
}
