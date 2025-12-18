package com.artivio.backend.modules.order.model;

import com.artivio.backend.modules.order.model.Chat;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.ToString;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(name = "artisan_id")
    private Long artisanId = 1L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", referencedColumnName = "id", nullable = true)
    @ToString.Exclude
    private Chat chat;

    @Column(name = "total_price")
    private BigDecimal totalPrice;
    private String status;

    @Column(name = "phone_number", nullable = false, length = 15)
    private String phoneNumber; // SĐT người nhận

    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address; // Địa chỉ giao hàng

    @Column(name = "note")
    private String note; // Ghi chú đơn hàng

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Quan hệ 1-nhiều với OrderItem
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems;
}
