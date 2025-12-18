'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Loader2, CheckCircle2, Truck, PackageCheck, XCircle } from 'lucide-react';
import {
  getStoredOrders,
  updateOrderStatus,
  type StoredOrder,
  type StoredOrderStatus,
} from '@/lib/ordersStorage';
import type { PaymentMethod } from '@/types';
import Image from 'next/image';


const statusConfig: Record<
  StoredOrderStatus,
  { label: string; badgeClass: string; description: string }
> = {
  pending: {
    label: 'Chờ xử lý',
    badgeClass: 'bg-gray-200 text-gray-700 border-transparent',
    description: 'Đơn hàng mới, chờ xác nhận',
  },
  confirmed: {
    label: 'Đã xác nhận',
    badgeClass: 'bg-blue-100 text-blue-700 border-transparent',
    description: 'Đã xác nhận, chuẩn bị xử lý',
  },
  processing: {
    label: 'Đang xử lý',
    badgeClass: 'bg-orange-100 text-orange-700 border-transparent',
    description: 'Đang đóng gói / chuẩn bị giao',
  },
  shipped: {
    label: 'Đã giao cho DVVC',
    badgeClass: 'bg-purple-100 text-purple-700 border-transparent',
    description: 'Đang vận chuyển',
  },
  delivered: {
    label: 'Đã giao',
    badgeClass: 'bg-green-100 text-green-700 border-transparent',
    description: 'Giao hàng thành công',
  },
  cancelled: {
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

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<StoredOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredOrders();
    setOrders(stored);
    setIsLoading(false);
  }, []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders]
  );

  const handleStatusChange = (orderId: number, status: StoredOrderStatus) => {
    const updatedOrders = updateOrderStatus(orderId, status);
    setOrders(updatedOrders);
  };

  const handleQuickAction = (order: StoredOrder, status: StoredOrderStatus) => {
    if (order.status === status) return;
    if (order.status === 'cancelled' || order.status === 'delivered') return;

    handleStatusChange(order.id, status);
  };

  const renderEmptyState = () => (
    <div className="rounded-lg border border-dashed border-[#E8D5B5] bg-white p-10 text-center">
      <p className="text-lg font-semibold" style={{ color: '#3F2E23' }}>
        Chưa có đơn hàng nào
      </p>
      <p className="mt-2 text-sm" style={{ color: '#6B4F3E' }}>
        Khi có đơn mới, hệ thống sẽ lưu vào đây tự động.
      </p>
    </div>
  );

  const actionButtonDisabled = {
    confirm: (status: StoredOrderStatus) => status !== 'pending',
    ship: (status: StoredOrderStatus) => status !== 'confirmed' && status !== 'processing',
    deliver: (status: StoredOrderStatus) => status !== 'shipped',
    cancel: (status: StoredOrderStatus) => status === 'delivered' || status === 'cancelled',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#3F2E23' }}>
          Quản lý đơn hàng
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#6B4F3E' }}>
          Xem, cập nhật trạng thái và chi tiết đơn hàng.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#E8D5B5] bg-white p-4 shadow-sm">
          <p className="text-sm" style={{ color: '#6B4F3E' }}>
            Tổng đơn
          </p>
          <p className="text-2xl font-bold" style={{ color: '#3F2E23' }}>
            {orders.length}
          </p>
        </div>
        <div className="rounded-xl border border-[#E8D5B5] bg-white p-4 shadow-sm">
          <p className="text-sm" style={{ color: '#6B4F3E' }}>
            Doanh thu dự kiến
          </p>
          <p className="text-2xl font-bold" style={{ color: '#3F2E23' }}>
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="rounded-xl border border-[#E8D5B5] bg-white p-4 shadow-sm">
          <p className="text-sm" style={{ color: '#6B4F3E' }}>
            Đang xử lý
          </p>
          <p className="text-2xl font-bold" style={{ color: '#3F2E23' }}>
            {orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E8D5B5] bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16" style={{ color: '#6B4F3E' }}>
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Đang tải đơn hàng...
          </div>
        ) : orders.length === 0 ? (
          renderEmptyState()
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Điện thoại</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-semibold" style={{ color: '#3F2E23' }}>
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.phone}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                  <TableCell className="text-sm">{paymentLabels[order.paymentMethod]}</TableCell>
                  <TableCell>
                    <Badge className={statusConfig[order.status].badgeClass}>
                      {statusConfig[order.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleString('vi-VN')}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="border-[#E8D5B5] text-[#3F2E23] hover:bg-[#FFF8F0]"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem
                        </Button>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as StoredOrderStatus)}
                          className="rounded-md border border-[#E8D5B5] bg-white px-2 py-1 text-sm"
                        >
                          {Object.keys(statusConfig).map((status) => (
                            <option key={status} value={status}>
                              {statusConfig[status as StoredOrderStatus].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8D5B5] px-6 py-4">
              <div>
                <p className="text-sm uppercase tracking-wide" style={{ color: '#6B4F3E' }}>
                  Chi tiết đơn hàng
                </p>
                <h3 className="text-xl font-bold" style={{ color: '#3F2E23' }}>
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <Badge className={statusConfig[selectedOrder.status].badgeClass}>
                {statusConfig[selectedOrder.status].label}
              </Badge>
            </div>

            <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold" style={{ color: '#3F2E23' }}>
                  Khách hàng
                </h4>
                <div className="rounded-lg border border-[#E8D5B5] bg-[#FFF8F0] p-4 text-sm">
                  <p className="font-semibold" style={{ color: '#3F2E23' }}>
                    {selectedOrder.customerName}
                  </p>
                  <p style={{ color: '#6B4F3E' }}>{selectedOrder.phone}</p>
                  <p style={{ color: '#6B4F3E' }}>{selectedOrder.shippingAddress.email}</p>
                  <p className="mt-2" style={{ color: '#6B4F3E' }}>
                    {selectedOrder.shippingAddress.address}
                  </p>
                  {selectedOrder.shippingAddress.note && (
                    <p className="mt-2 italic" style={{ color: '#6B4F3E' }}>
                      Ghi chú: {selectedOrder.shippingAddress.note}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold" style={{ color: '#3F2E23' }}>
                    Thanh toán
                  </h4>
                  <div className="mt-2 rounded-lg border border-[#E8D5B5] bg-[#FFF8F0] p-4 text-sm">
                    <p style={{ color: '#3F2E23' }}>{paymentLabels[selectedOrder.paymentMethod]}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold" style={{ color: '#3F2E23' }}>
                  Sản phẩm
                </h4>
                <div className="space-y-3 rounded-lg border border-[#E8D5B5] bg-[#FFF8F0] p-4">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={`${selectedOrder.id}-${item.productId}`}
                      className="flex items-center gap-4 text-sm"
                    >
                      {/* Ảnh sản phẩm */}
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#E8D5B5]">
                        <Image
                          src={item.image || '/placeholder.png'}
                          alt={item.productName}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>

                      {/* Thông tin */}
                      <div className="flex-1">
                        <p className="font-semibold" style={{ color: '#3F2E23' }}>
                          {item.productName}
                        </p>
                        <p style={{ color: '#6B4F3E' }}>
                          Số lượng: {item.quantity}
                        </p>
                      </div>

                      {/* Giá */}
                      <p className="font-semibold" style={{ color: '#3F2E23' }}>
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}

                </div>

                <div className="rounded-lg border border-[#E8D5B5] bg-[#FFF8F0] p-4 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: '#6B4F3E' }}>Tạm tính</span>
                    <span className="font-semibold" style={{ color: '#3F2E23' }}>
                      {formatCurrency(selectedOrder.subtotal)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span style={{ color: '#6B4F3E' }}>Phí vận chuyển</span>
                    <span className="font-semibold" style={{ color: '#3F2E23' }}>
                      {formatCurrency(selectedOrder.shippingFee)}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between border-t border-[#E8D5B5] pt-3">
                    <span className="font-semibold" style={{ color: '#3F2E23' }}>
                      Tổng cộng
                    </span>
                    <span className="text-lg font-bold" style={{ color: '#3F2E23' }}>
                      {formatCurrency(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#E8D5B5] px-6 py-4">
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                className="border-[#E8D5B5] text-[#3F2E23] hover:bg-[#FFF8F0]"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;



