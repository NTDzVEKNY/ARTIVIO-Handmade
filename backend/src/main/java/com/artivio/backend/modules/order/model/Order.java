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

    @Column(name = "full_name", nullable = false)
    private String fullName; // Tên người nhận

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
