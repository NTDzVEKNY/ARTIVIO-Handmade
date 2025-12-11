import { NextResponse } from 'next/server';
import { db } from '@/app/api/_lib/mockData';
import type { Order, ShippingAddress, PaymentMethod, OrderItem } from '@/types';

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
      const product = db.products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ message: `Sản phẩm ${item.productName} không tồn tại` }, { status: 404 });
      }
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { message: `Sản phẩm ${item.productName} không đủ số lượng trong kho` },
          { status: 400 }
        );
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order
    const order: Order = {
      id: Date.now(),
      items: items as OrderItem[],
      shippingAddress: shippingAddress as ShippingAddress,
      paymentMethod: paymentMethod as PaymentMethod,
      subtotal: Number(subtotal) || 0,
      shippingFee: Number(shippingFee) || 0,
      total: Number(total) || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      orderNumber,
    };

    // Save order
    db.orders.push(order);

    // In a real application, you would:
    // 1. Update product stock quantities
    // 2. Create payment transaction
    // 3. Send confirmation email
    // 4. Update inventory

    return NextResponse.json(
      {
        message: 'Đặt hàng thành công',
        orderId: order.id,
        orderNumber: order.orderNumber,
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
      return NextResponse.json(order);
    }

    if (userId) {
      const userOrders = db.orders.filter((o) => o.userId === Number(userId));
      return NextResponse.json(userOrders);
    }

    // Return all orders (in production, this should be admin-only)
    return NextResponse.json(db.orders.filter(() => true));
  } catch (error) {
    console.error('Get orders API error:', error);
    return NextResponse.json({ message: 'Lỗi không xác định từ server.' }, { status: 500 });
  }
}

