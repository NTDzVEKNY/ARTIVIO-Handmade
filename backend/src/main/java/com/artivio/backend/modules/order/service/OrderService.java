package com.artivio.backend.modules.order.service;

import com.artivio.backend.modules.order.model.Chat;
import com.artivio.backend.modules.order.repository.ChatRepository;
import com.artivio.backend.modules.order.dto.OrderItemRequestDTO;
import com.artivio.backend.modules.order.dto.OrderRequestDTO;
import com.artivio.backend.modules.order.mapper.OrderMapper;
import com.artivio.backend.modules.order.model.Order;
import com.artivio.backend.modules.order.model.OrderItem;
import com.artivio.backend.modules.order.repository.OrderRepository;
import com.artivio.backend.modules.order.model.Product;
import com.artivio.backend.modules.order.model.User;
import com.artivio.backend.modules.order.repository.ProductRepository;
import com.artivio.backend.modules.order.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.artivio.backend.modules.order.dto.OrderProgressResponseDTO;


import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    // [NEW] Inject thêm ChatRepository để xử lý UC06
    @Autowired
    private ChatRepository chatRepository;

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

        // [NEW] Xử lý logic liên kết với Chat (UC06)
        if (orderRequest.getChatId() != null) {
            Chat chat = chatRepository.findById(orderRequest.getChatId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc hội thoại ID: " + orderRequest.getChatId()));

            // Validate: Đảm bảo người đặt đơn chính là khách hàng trong đoạn chat
            // (Giả sử Order đã được map Customer từ token/DTO)
            if (order.getCustomer() != null && !chat.getCustomer().getId().equals(order.getCustomer().getId())) {
                throw new RuntimeException("Bạn không có quyền tạo đơn hàng từ cuộc hội thoại này!");
            }

            order.setChat(chat);
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal finalTotalPrice = BigDecimal.ZERO;

        // 2. Duyệt qua danh sách sản phẩm khách chọn
        for (OrderItemRequestDTO itemDto : orderRequest.getItems()) {
            Product product = this.decreaseStock(itemDto.getProductId(), itemDto.getQuantity());

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

        System.out.println(">>> DATA DUMP: " + order.getArtisanId());

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

        // 2. Validate trạng thái
        if (!"PENDING".equals(order.getStatus()) && !"CONFIRMED".equals(order.getStatus())) {
            throw new RuntimeException("Không thể hủy đơn hàng đang giao hoặc đã hoàn thành!");
        }

        // 3. HOÀN KHO
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();

            // Cộng lại kho
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());

            // Trừ đi số đã bán
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
        orderRepository.deleteById(id);
    }

    // Hàm này vừa check tồn kho vừa trừ kho luôn
    @Transactional
    public Product decreaseStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + productId));

        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Sản phẩm " + product.getProductName() + " không đủ số lượng tồn kho!");
        }

        // Trừ kho
        product.setStockQuantity(product.getStockQuantity() - quantity);

        // Tăng số lượng đã bán
        int currentSold = product.getQuantitySold() == null ? 0 : product.getQuantitySold();
        product.setQuantitySold(currentSold + quantity);

        return productRepository.save(product);
    }

    // --- THEO DÕI TIẾN ĐỘ (HÀNG ĐẶT RIÊNG) ---
    public List<OrderProgressResponseDTO> getCustomOrdersProgress(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        List<Order> customOrders = orderRepository.findByCustomerIdAndChatIdIsNotNullOrderByCreatedAtDesc(user.getId());

        if (customOrders.isEmpty()) {
            return Collections.emptyList();
        }

        return customOrders.stream().map(orderMapper::mapToDTO).collect(Collectors.toList());
    }

    // --- LẤY TẤT CẢ ĐƠN HÀNG ---
    public List<OrderProgressResponseDTO> getAllMyOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId());
        return orders.stream().map(orderMapper::mapToDTO).collect(Collectors.toList());
    }
}
