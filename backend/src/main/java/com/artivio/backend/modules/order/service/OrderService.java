package com.artivio.backend.modules.order.service;

import com.artivio.backend.modules.order.dto.OrderItemRequestDTO;
import com.artivio.backend.modules.order.dto.OrderRequestDTO;
import com.artivio.backend.modules.order.mapper.OrderMapper;
import com.artivio.backend.modules.order.model.Order;
import com.artivio.backend.modules.order.model.OrderItem;
import com.artivio.backend.modules.order.repository.OrderRepository;
import com.artivio.backend.modules.product.model.Product;
import com.artivio.backend.modules.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private ProductRepository productRepository;

    @Transactional(rollbackFor = Exception.class)
    public Order createOrder(OrderRequestDTO orderRequest) {
        // 1. Tạo đối tượng Order từ DTO
        Order order = orderMapper.toEntity(orderRequest);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal finalTotalPrice = BigDecimal.ZERO;

        // 2. Duyệt qua danh sách sản phẩm khách chọn
        for (OrderItemRequestDTO itemDto : orderRequest.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + itemDto.getProductId()));
            // --- KIỂM TRA TỒN KHO ---
            if (product.getStockQuantity() < itemDto.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + product.getProductName() + " đã hết hàng hoặc không đủ số lượng!");
            }

            // TRỪ KHO & TĂNG ĐÃ BÁN ---
            // Trừ kho
            product.setStockQuantity(product.getStockQuantity() - itemDto.getQuantity());
            // Tăng đã bán (xử lý null nếu là sp mới chưa bán cái nào)
            int currentSold = product.getQuantitySold() == null ? 0 : product.getQuantitySold();
            product.setQuantitySold(currentSold + itemDto.getQuantity());

            // LƯU LẠI PRODUCT VÀO DB
            productRepository.save(product);

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            item.setOrder(order);

            Double currentProductPrice = product.getPrice();
            BigDecimal priceForOrder = BigDecimal.valueOf(currentProductPrice);

            // LƯU GIÁ VÀO ORDER_ITEM (Snapshot price)
            item.setPriceOrder(priceForOrder);

            // Cộng dồn vào tổng tiền đơn hàng: (Giá * Số lượng)
            BigDecimal lineTotal = priceForOrder.multiply(BigDecimal.valueOf(item.getQuantity()));
            finalTotalPrice = finalTotalPrice.add(lineTotal);

            orderItems.add(item);
        }

        // 3. Set danh sách item và tổng tiền vào Order
        order.setOrderItems(orderItems);
        order.setTotalPrice(finalTotalPrice);

        // 4. Lưu xuống DB (Cascade sẽ tự lưu OrderItems)
        return orderRepository.save(order);
    }
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng có ID: " + id));
    }
}
