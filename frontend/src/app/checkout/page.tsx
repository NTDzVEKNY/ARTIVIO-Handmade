'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ShippingAddress, PaymentMethod } from '@/types';
import { fetchApi } from '@/services/api';
import { appendOrderToStorage } from '@/lib/ordersStorage';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    note: '',
  });

  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  const subtotal = getTotalPrice();
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!shippingAddress.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(shippingAddress.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!shippingAddress.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!shippingAddress.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        product_id: item.id,
        productName: item.productName,
        price: Number(item.price),
        quantity: item.quantity,
        image: item.image,
      }));

      const orderData = {
        items: orderItems,
        shippingAddress,
        paymentMethod,
        subtotal,
        shippingFee,
        total,
      };

      const response = await fetchApi<{ orderId: number; orderNumber: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      appendOrderToStorage({
        id: response.orderId,
        orderNumber: response.orderNumber || `ART-${response.orderId}`,
        customerName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        status: 'pending',
        createdAt: new Date().toISOString(),
        subtotal,
        shippingFee,
        total,
        paymentMethod,
        shippingAddress,
        items: orderItems.map((item) => ({
          productId: item.product_id,
          productName: item.productName,
          quantity: item.quantity,
          price: Number(item.price),
          image: item.image,
        })),
      });

      // Clear cart after successful order
      clearCart();

      // Show success notification
      setShowSuccessNotification(true);

      // Redirect to success page after a short delay
      setTimeout(() => {
        router.push(`/checkout/success?orderId=${response.orderId}&orderNumber=${response.orderNumber}`);
      }, 1500);
    } catch (error: unknown) {
      console.error('Order submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white">
      <Header />

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5 duration-300">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
            <svg
              className="w-6 h-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <p className="font-semibold">Đặt hàng thành công!</p>
              <p className="text-sm">Đang chuyển đến trang xác nhận...</p>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Shipping & Payment Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Shipping Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin giao hàng</h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="fullName"
                        type="text"
                        value={shippingAddress.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={errors.fullName ? 'border-red-500' : ''}
                        placeholder="Nhập họ và tên"
                      />
                      {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingAddress.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={errors.phone ? 'border-red-500' : ''}
                          placeholder="0123456789"
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingAddress.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={errors.email ? 'border-red-500' : ''}
                          placeholder="email@example.com"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ giao hàng <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="address"
                        value={shippingAddress.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                        className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          errors.address ? 'border-red-500' : ''
                        }`}
                        placeholder="Nhập địa chỉ đầy đủ (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>

                    <div>
                      <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú (tùy chọn)
                      </label>
                      <textarea
                        id="note"
                        value={shippingAddress.note}
                        onChange={(e) => handleInputChange('note', e.target.value)}
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Ghi chú thêm cho đơn hàng..."
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>

                  <div className="space-y-4">
                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                        <div className="text-sm text-gray-600 mt-1">Thanh toán bằng tiền mặt khi nhận hàng</div>
                      </div>
                    </label>

                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Chuyển khoản ngân hàng</div>
                        <div className="text-sm text-gray-600 mt-1">Chuyển khoản qua tài khoản ngân hàng</div>
                      </div>
                    </label>

                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={paymentMethod === 'credit_card'}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Thẻ tín dụng/Ghi nợ</div>
                        <div className="text-sm text-gray-600 mt-1">Thanh toán bằng thẻ Visa, Mastercard</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Đơn hàng của bạn</h2>

                  {/* Order Items */}
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={item.image ? (item.image.startsWith('//') ? `https:${item.image}` : item.image) : item.image || '/hero-handmade.jpg'}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{item.productName}</h3>
                          <p className="text-sm text-gray-600 mt-1">Số lượng: {item.quantity}</p>
                          <p className="text-sm font-bold text-[#0f172a] mt-1">
                            ₫{(Number(item.price) * item.quantity).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Tạm tính:</span>
                      <span className="font-medium">₫{subtotal.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Phí vận chuyển:</span>
                      <span className="font-medium">
                        {shippingFee === 0 ? (
                          <span className="text-green-600">Miễn phí</span>
                        ) : (
                          `₫${shippingFee.toLocaleString('vi-VN')}`
                        )}
                      </span>
                    </div>
                    {subtotal < 500000 && (
                      <p className="text-xs text-gray-500">
                        💡 Mua thêm ₫{(500000 - subtotal).toLocaleString('vi-VN')} để được miễn phí vận chuyển
                      </p>
                    )}
                    <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                      <span>Tổng cộng:</span>
                      <span className="text-[#0f172a]">₫{total.toLocaleString('vi-VN')}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-[#0f172a] text-white hover:bg-gray-800"
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                  </Button>

                  <div className="mt-6 pt-6 border-t text-sm text-gray-500">
                    <p className="mb-2">💳 Thanh toán an toàn</p>
                    <p className="mb-2">🚚 Miễn phí vận chuyển cho đơn hàng trên 500.000₫</p>
                    <p>↩️ Đổi trả trong 7 ngày</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

