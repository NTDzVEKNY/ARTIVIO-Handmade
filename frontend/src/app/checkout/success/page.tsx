'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import type { Order } from '@/types';
import { fetchApi } from '@/services/api';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push('/cart');
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderData = await fetchApi<Order>(`/orders?orderId=${orderId}`);
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen font-sans text-gray-800 bg-white">
        <Header />
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f172a] mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen font-sans text-gray-800 bg-white">
        <Header />
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Không tìm thấy đơn hàng</h1>
            <p className="text-gray-600 mb-8">Đơn hàng không tồn tại hoặc đã bị xóa.</p>
            <Link
              href="/shop/products"
              className="inline-block bg-[#0f172a] text-white px-8 py-3 rounded-full font-semibold shadow hover:bg-gray-800 transition-all duration-300"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cod':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'bank_transfer':
        return 'Chuyển khoản ngân hàng';
      case 'credit_card':
        return 'Thẻ tín dụng/Ghi nợ';
      default:
        return method;
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ xử lý';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đã giao hàng';
      case 'delivered':
        return 'Đã nhận hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white">
      <Header />

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Đặt hàng thành công!</h1>
            <p className="text-lg text-gray-600 mb-2">
              Cảm ơn bạn đã đặt hàng. Chúng tôi đã nhận được đơn hàng của bạn và sẽ xử lý trong thời gian sớm nhất.
            </p>
            <p className="text-sm text-gray-500">
              Mã đơn hàng: <span className="font-bold text-[#0f172a]">{order.orderNumber}</span>
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Chi tiết đơn hàng</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã đơn hàng</p>
                  <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày đặt hàng</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <p className="font-semibold text-gray-900">{getStatusName(order.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                  <p className="font-semibold text-gray-900">{getPaymentMethodName(order.paymentMethod)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Địa chỉ giao hàng</h2>
            <div className="text-gray-700">
              <p className="font-semibold mb-2">{order.shippingAddress.fullName}</p>
              <p className="text-sm mb-1">📞 {order.shippingAddress.phone}</p>
              <p className="text-sm mb-1">✉️ {order.shippingAddress.email}</p>
              <p className="text-sm">
                📍 {order.shippingAddress.address}
              </p>
              {order.shippingAddress.note && (
                <p className="text-sm mt-2 text-gray-600">
                  <span className="font-medium">Ghi chú:</span> {order.shippingAddress.note}
                </p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Sản phẩm đã đặt</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.productId} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.productName}</h3>
                    <p className="text-sm text-gray-600 mb-2">Số lượng: {item.quantity}</p>
                    <p className="font-bold text-[#0f172a]">
                      ₫{(item.price * item.quantity).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span className="font-medium">₫{order.subtotal.toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span className="font-medium">
                  {order.shippingFee === 0 ? (
                    <span className="text-green-600">Miễn phí</span>
                  ) : (
                    `₫${order.shippingFee.toLocaleString('vi-VN')}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t">
                <span>Tổng cộng:</span>
                <span className="text-[#0f172a]">₫{order.total.toLocaleString('vi-VN')}</span>
              </div>
            </div>
          </div>

          {/* Payment Instructions for Bank Transfer */}
          {order.paymentMethod === 'bank_transfer' && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-6">
              <h3 className="font-bold text-blue-900 mb-4">Hướng dẫn thanh toán</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>Vui lòng chuyển khoản số tiền <strong>₫{order.total.toLocaleString('vi-VN')}</strong> đến:</p>
                <div className="bg-white p-4 rounded-lg mt-3">
                  <p><strong>Ngân hàng:</strong> Vietcombank</p>
                  <p><strong>Số tài khoản:</strong> 1234567890</p>
                  <p><strong>Chủ tài khoản:</strong> ARTIVIO HANDMADE</p>
                  <p><strong>Nội dung chuyển khoản:</strong> {order.orderNumber}</p>
                </div>
                <p className="mt-3">Sau khi chuyển khoản, vui lòng gửi ảnh biên lai qua email hoặc liên hệ hotline để chúng tôi xác nhận đơn hàng.</p>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Bước tiếp theo</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ Chúng tôi đã gửi email xác nhận đơn hàng đến địa chỉ email của bạn.</li>
              <li>📦 Đơn hàng sẽ được xử lý trong vòng 1-2 ngày làm việc.</li>
              <li>🚚 Bạn sẽ nhận được thông báo khi đơn hàng được giao.</li>
              <li>📞 Nếu có thắc mắc, vui lòng liên hệ hotline: 0903 803 556</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/shop/products"
              className="flex-1 bg-[#0f172a] text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-gray-800 transition-all duration-300 text-center"
            >
              Tiếp tục mua sắm
            </Link>
            <Link
              href="/"
              className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold hover:border-gray-400 transition-all duration-300 text-center"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

