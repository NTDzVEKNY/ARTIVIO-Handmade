package com.artivio.backend.modules.chat.model;

import com.artivio.backend.modules.order.model.OrderItem;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.artivio.backend.modules.chat.model.EnumStatus;
import com.artivio.backend.modules.chat.model.User;


import java.util.List;

@Entity(name = "ChatProduct")
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @Column(name = "id")
    private Long id;

    // --- PHẦN QUAN TRỌNG: XỬ LÝ riêng cho admin ---

    @Column(name = "artisan_id")
    @Builder.Default
    private Long artisan_id = 1L; // hiện tại mặc định sẽ là admin

    //Map thêm Object User để có method getArtisan()
    // insertable = false, updatable = false: Để tránh lỗi map 2 lần vào cùng 1 cột
    // Khi lưu Product, Hibernate sẽ dùng giá trị của biến 'artisanId' ở trên
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artisan_id", insertable = false, updatable = false)
    private User artisan;

    // ----------------------------------------------

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

    // Quan hệ 1-nhiều với OrderItem
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems;
}
