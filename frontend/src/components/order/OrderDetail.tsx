import type { PaymentMethod } from '@/types';
import React from 'react';

interface Product {
    name: string;
    price: number;
    image: string | null;
}

interface OrderItem {
    id: number;
    product_id: number;
    quantity: number;
    price_order: number;
    product: Product | null;
}

interface OrderDetailData {
    id: number;
    created_at: string;
    status: string;
    payment_method: PaymentMethod;
    items: OrderItem[];
    customer: { name: string; email: string } | null;
    address: string;
    phone_number: string;
    note: string | null;
    total_price: number;
}

interface OrderDetailProps {
    order: OrderDetailData;
}

const statusConfig: Record<
  string,
  { label: string; badgeClass: string; description: string }
> = {
  PENDING: {
    label: 'Chờ xử lý',
    badgeClass: 'bg-gray-200 text-gray-700 border-transparent',
    description: 'Đơn hàng mới, chờ xác nhận',
  },
  IN_PROGRESS: {
    label: 'Đang xử lý',
    badgeClass: 'bg-blue-100 text-blue-700 border-transparent',
    description: 'Đang thực hiện đơn hàng',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    badgeClass: 'bg-green-100 text-green-700 border-transparent',
    description: 'Giao hàng thành công',
  },
  CANCELLED: {
    label: 'Đã hủy',
    badgeClass: 'bg-red-100 text-red-700 border-transparent',
    description: 'Đơn hàng đã bị hủy',
  },
};

const paymentLabels: Record<PaymentMethod, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank_transfer: 'Chuyển khoản ngân hàng',
  credit_card: 'Thẻ tín dụng/Ghi nợ',
};

const formatCurrency = (value: number) => `₫${value.toLocaleString('vi-VN')}`;


const OrderDetail: React.FC<OrderDetailProps> = ({ order }) => {
    const currentStatus = statusConfig[order.status] || statusConfig.PENDING;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Chi tiết đơn hàng</h1>
            <p className="text-lg text-gray-600 mb-2">Mã đơn hàng: <span className="font-semibold">{order.id}</span></p>
             <p className="text-sm text-gray-500 mb-8">Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Sản phẩm</h2>
                        <ul>
                            {order.items.map((item) => (
                                <li key={item.product_id} className="flex justify-between items-center py-3 border-b">
                                    <div>
                                        <p className="font-semibold">{item.product?.name || 'Sản phẩm đã xóa'}</p>
                                        <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">{formatCurrency(item.price_order * item.quantity)}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="pt-4 space-y-2 text-right">
                            <p>Tạm tính: <span className="font-semibold">{formatCurrency(order.items.reduce((acc: number, item: OrderItem) => acc + item.price_order * item.quantity, 0))}</span></p>
                            <p>Phí vận chuyển: <span className="font-semibold">{formatCurrency(0)}</span></p>
                            <p className="text-lg font-bold">Tổng cộng: <span className="text-xl">{formatCurrency(order.total_price)}</span></p>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Thông tin khách hàng</h2>
                        <div className="space-y-1 text-gray-700">
                             <p><strong>{order.customer?.name || 'Khách hàng'}</strong></p>
                             <p>{order.address}</p>
                             <p>{order.phone_number}</p>
                             <p>{order.customer?.email}</p>
                             {order.note && <p className="pt-2 italic">Ghi chú: {order.note}</p>}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Trạng thái đơn hàng</h2>
                        <div>
                             <span className={`px-3 py-1 rounded-full text-sm font-semibold ${currentStatus.badgeClass}`}>
                                {currentStatus.label}
                            </span>
                            <p className="text-sm text-gray-600 mt-2">{currentStatus.description}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Thanh toán</h2>
                        <p>{paymentLabels[order.payment_method]}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
