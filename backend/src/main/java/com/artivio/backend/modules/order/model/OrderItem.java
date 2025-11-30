package com.artivio.backend.modules.order.model;

import com.artivio.backend.modules.product.model.Product;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;
    private Integer quantity;

    // Giá tại thời điểm mua (không đổi dù giá product sau này có đổi)
    @Column(name = "price_order")
    private BigDecimal priceOrder;
}
