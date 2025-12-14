package com.artivio.backend.modules.order.service;

import com.artivio.backend.modules.order.dto.OrderItemRequestDTO;
import com.artivio.backend.modules.order.dto.OrderRequestDTO;
import com.artivio.backend.modules.order.mapper.OrderMapper;
import com.artivio.backend.modules.order.model.Order;
import com.artivio.backend.modules.order.model.OrderItem;
import com.artivio.backend.modules.order.repository.OrderRepository;
import com.artivio.backend.modules.product.model.Product;
import com.artivio.backend.modules.product.repository.ProductRepository;
import com.artivio.backend.modules.product.service.HandmadeService;
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

    @Autowired
    private HandmadeService handmadeService;

    @Transactional(rollbackFor = Exception.class)
    public Order createOrder(OrderRequestDTO orderRequest) {
        // 1. Tạo đối tượng Order từ DTO
        Order order = orderMapper.toEntity(orderRequest);

        if ("COD".equalsIgnoreCase(orderRequest.getPaymentMethod())) {
            order.setPaymentMethod("COD");
        }
        else if ("ONLINE".equalsIgnoreCase(orderRequest.getPaymentMethod())) {
            order.setPaymentMethod("ONLINE");
        }
        else {
            throw new RuntimeException("Phương thức thanh toán không hợp lệ!");
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal finalTotalPrice = BigDecimal.ZERO;

        // 2. Duyệt qua danh sách sản phẩm khách chọn
        for (OrderItemRequestDTO itemDto : orderRequest.getItems()) {
            Product product = handmadeService.decreaseStock(itemDto.getProductId(), itemDto.getQuantity());

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

    @Transactional(rollbackFor = Exception.class)
    public Order cancelOrder(Long orderId) {
        // 1. Tìm đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // 2. Validate trạng thái (Chỉ cho hủy khi đang chờ hoặc đã xác nhận)
        if (!"PENDING".equals(order.getStatus()) && !"CONFIRMED".equals(order.getStatus())) {
            throw new RuntimeException("Không thể hủy đơn hàng đang giao hoặc đã hoàn thành!");
        }

        // 3. HOÀN KHO (Trả lại số lượng sản phẩm)
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();

            // Cộng lại kho
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());

            // Trừ đi số đã bán (nếu cần thiết quản lý chặt)
            int currentSold = product.getQuantitySold() == null ? 0 : product.getQuantitySold();
            product.setQuantitySold(Math.max(0, currentSold - item.getQuantity()));

            productRepository.save(product);
        }

        // 4. Cập nhật trạng thái đơn
        order.setStatus("CANCELLED");
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // Có thể thêm logic validate chuyển trạng thái
        // Ví dụ: Không thể chuyển từ CANCELLED sang PENDING
        if ("CANCELLED".equals(order.getStatus())) {
            throw new RuntimeException("Đơn đã hủy không thể cập nhật trạng thái khác!");
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    public void deleteOrderPermanently(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Đơn hàng không tồn tại để xóa!");
        }

        // Vì bên Entity Order đã để cascade = CascadeType.ALL
        // nên khi xóa Order, các OrderItem liên quan sẽ tự động bị xóa theo.
        orderRepository.deleteById(id);
    }
}
