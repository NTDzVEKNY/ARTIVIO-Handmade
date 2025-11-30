package com.artivio.backend.modules.order.model;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;
    @Column(name = "artisan_id")
    private Long artisanId;
    @Column(name = "chat_id", nullable = true)
    private Long chatId;

    @Column(name = "total_price")
    private BigDecimal totalPrice;
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Quan hệ 1-nhiều với OrderItem
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems;
}
