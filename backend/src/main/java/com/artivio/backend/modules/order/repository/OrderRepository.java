package com.artivio.backend.modules.order.repository;

import com.artivio.backend.modules.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Lấy tất cả đơn hàng của User
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    // Lấy đơn hàng đặt riêng (Custom Order) -> Có chat_id (Not Null)
    // Phục vụ cho tính năng "Theo dõi tiến độ"
    List<Order> findByCustomerIdAndChatIdIsNotNullOrderByCreatedAtDesc(Long customerId);
}
