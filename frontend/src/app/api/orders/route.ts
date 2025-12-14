import { NextResponse } from 'next/server';
import { db, type Order, type OrderItem } from '../_lib/mockData';
import type { ShippingAddress, PaymentMethod } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, shippingAddress, paymentMethod, subtotal, shippingFee, total } = body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Giỏ hàng trống' }, { status: 400 });
    }

    if (!shippingAddress) {
      return NextResponse.json({ message: 'Vui lòng cung cấp thông tin giao hàng' }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({ message: 'Vui lòng chọn phương thức thanh toán' }, { status: 400 });
    }

    // Validate shipping address fields
    const requiredFields: (keyof ShippingAddress)[] = ['fullName', 'phone', 'email', 'address'];
    for (const field of requiredFields) {
      if (!shippingAddress[field] || !shippingAddress[field].trim()) {
        return NextResponse.json({ message: `Vui lòng điền đầy đủ thông tin ${field}` }, { status: 400 });
      }
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(shippingAddress.phone.replace(/\s/g, ''))) {
      return NextResponse.json({ message: 'Số điện thoại không hợp lệ' }, { status: 400 });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingAddress.email)) {
      return NextResponse.json({ message: 'Email không hợp lệ' }, { status: 400 });
    }

    // Check product availability
    for (const item of items) {
      const product = db.products.find((p) => p.id === item.product_id);
      if (!product) {
        return NextResponse.json({ message: `Sản phẩm ${item.name} không tồn tại` }, { status: 404 });
      }
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { message: `Sản phẩm ${item.name} không đủ số lượng trong kho` },
          { status: 400 }
        );
      }
    }

    // Generate order number
    const orderId = Date.now();

    // Create order
    const order: Order = {
      id: orderId,
      customer_id: 1, // Assuming a default customer_id
      artisan_id: 1, // Assuming a default artisan_id
      chat_id: null,
      total_price: Number(total) || 0,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save order
    db.orders.push(order);

    // Create and save order items
    for (const item of items) {
      const orderItem: OrderItem = {
        id: Date.now() + item.product_id,
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price_order: item.price,
      };
      db.orderItems.push(orderItem);
    }

    // In a real application, you would:
    // 1. Update product stock quantities
    // 2. Create payment transaction
    // 3. Send confirmation email
    // 4. Update inventory

    return NextResponse.json(
      {
        message: 'Đặt hàng thành công',
        orderId: order.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order API error:', error);
    return NextResponse.json({ message: 'Lỗi không xác định từ server.' }, { status: 500 });
  }
}

// Get orders (for future use - order history)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');

    if (orderId) {
      const order = db.orders.find((o) => o.id === Number(orderId));
      if (!order) {
        return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
      }

      // Lấy các mục hàng (order items) liên quan đến đơn hàng
      const orderItems = db.orderItems.filter(item => item.order_id === order.id);
      
      // Lấy chi tiết sản phẩm cho từng mục hàng
      const detailedItems = orderItems.map(item => {
        const product = db.products.find(p => p.id === item.product_id);
        return {
          productId: item.product_id,
          productName: product?.name || 'Sản phẩm không xác định',
          quantity: item.quantity,
          price: item.price_order,
          image: product?.image || '',
        };
      });

      // --- Dữ liệu giả lập vì chúng ta không lưu chúng ---
      const mockShippingAddress = {
        fullName: "Khách hàng Artivio",
        phone: "0903803556",
        email: "customer@example.com",
        address: "123 Đường ABC, Phường 1, Quận 2, Thành phố XYZ",
        note: "Giao hàng trong giờ hành chính.",
      };

      const mockPaymentMethod = 'cod';
      const subtotal = detailedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shippingFee = subtotal >= 500000 ? 0 : 30000;
      // --- Kết thúc dữ liệu giả lập ---

      // Tạo đối tượng trả về chi tiết
      const fullOrderDetails = {
        id: order.id,
        orderNumber: `ART-${order.id}`, // Tạo order number giả
        createdAt: order.created_at,
        status: order.status.toLowerCase(),
        total: order.total_price,
        items: detailedItems,
        shippingAddress: mockShippingAddress,
        paymentMethod: mockPaymentMethod,
        subtotal: subtotal,
        shippingFee: shippingFee,
      };

      return NextResponse.json(fullOrderDetails);
    }

    if (userId) {
      // Logic này vẫn giữ nguyên, nhưng trong ứng dụng thực tế cũng cần trả về chi tiết
      const userOrders = db.orders.filter((o) => o.customer_id === Number(userId));
      return NextResponse.json(userOrders);
    }

    // Trả về tất cả đơn hàng (chỉ dành cho admin)
    return NextResponse.json(db.orders);
  } catch (error) {
    console.error('Get orders API error:', error);
    return NextResponse.json({ message: 'Lỗi không xác định từ server.' }, { status: 500 });
  }
}

