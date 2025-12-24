'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
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
  type StoredOrder,
  type StoredOrderStatus,
} from '@/lib/ordersStorage';
import type { PaymentMethod } from '@/types';
import Image from 'next/image';
import { fetchApi } from '@/services/api';
import { mapFrontendToBackendStatus, mapBackendToFrontendStatus } from '@/utils/orderStatusMapper';
import toast, { Toaster } from 'react-hot-toast';
import type { RawAdminOrderList } from '@/types/apiTypes';


// Simplified status configuration - only 4 statuses: pending, processing, delivered, cancelled
const statusConfig: Partial<Record<
  StoredOrderStatus,
  { label: string; badgeClass: string; description: string }
>> = {
  pending: {
    label: 'Chờ xử lý',
    badgeClass: 'bg-gray-200 text-gray-700 border-transparent',
    description: 'Đơn hàng mới, chờ xác nhận',
  },
  processing: {
    label: 'Đang xử lý',
    badgeClass: 'bg-orange-100 text-orange-700 border-transparent',
    description: 'Đang đóng gói / chuẩn bị giao',
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
  // Keep confirmed and shipped for backward compatibility with existing data
  // but they won't appear in the dropdown
  confirmed: {
    label: 'Đã xác nhận',
    badgeClass: 'bg-blue-100 text-blue-700 border-transparent',
    description: 'Đã xác nhận, chuẩn bị xử lý',
  },
  shipped: {
    label: 'Đã giao cho DVVC',
    badgeClass: 'bg-purple-100 text-purple-700 border-transparent',
    description: 'Đang vận chuyển',
  },
};

const paymentLabels: Record<PaymentMethod, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank_transfer: 'Chuyển khoản ngân hàng',
  credit_card: 'Thẻ tín dụng/Ghi nợ',
};

const formatCurrency = (value: number) => `₫${value.toLocaleString('vi-VN')}`;

// Map backend order to frontend StoredOrder format
const mapAdminOrderToStoredOrder = (rawOrder: RawAdminOrderList): StoredOrder => {
  const mapBackendPaymentMethodToFrontend = (backendMethod: string): PaymentMethod => {
    switch (backendMethod) {
      case 'COD':
        return 'cod';
      case 'ONLINE':
        return 'bank_transfer';
      default:
        return 'cod';
    }
  };

  // Normalize status: convert confirmed/shipped to simplified statuses
  const normalizeStatus = (status: StoredOrderStatus): StoredOrderStatus => {
    if (status === 'confirmed') return 'pending'; // confirmed → pending
    if (status === 'shipped') return 'processing'; // shipped → processing
    return status; // Keep pending, processing, delivered, cancelled as is
  };

  return {
    id: rawOrder.id,
    orderNumber: rawOrder.orderNumber,
    customerName: rawOrder.customerName,
    phone: rawOrder.phone,
    status: normalizeStatus(mapBackendToFrontendStatus(rawOrder.status)),
    createdAt: rawOrder.createdAt,
    subtotal: Number(rawOrder.subtotal),
    shippingFee: Number(rawOrder.shippingFee || 0),
    total: Number(rawOrder.total),
    paymentMethod: mapBackendPaymentMethodToFrontend(rawOrder.paymentMethod),
    shippingAddress: {
      fullName: rawOrder.customerName,
      phone: rawOrder.phone,
      email: '', // Backend doesn't provide email
      address: rawOrder.shippingAddress,
      note: rawOrder.note || undefined,
    },
    items: rawOrder.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: Number(item.price),
      image: item.image || undefined,
    })),
  };
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<StoredOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const rawOrders = await fetchApi<RawAdminOrderList[]>('/orders/admin/all');
      const mappedOrders = rawOrders.map(mapAdminOrderToStoredOrder);
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders]
  );

  const handleStatusChange = async (orderId: number, status: StoredOrderStatus) => {
    try {
      // Map frontend status to backend status
      const backendStatus = mapFrontendToBackendStatus(status);
      
      // Update status in backend
      await fetchApi(`/orders/${orderId}/status?status=${backendStatus}`, {
        method: 'PUT',
      });
      
      // Refresh orders from API to get updated data
      await fetchOrders();
      
      toast.success('Cập nhật trạng thái đơn hàng thành công');
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Không thể cập nhật trạng thái đơn hàng');
    }
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

  // Simplified: removed quick action buttons, only using dropdown
  // Keeping this for potential future use but not currently used
  const actionButtonDisabled = {
    confirm: (status: StoredOrderStatus) => status !== 'pending',
    ship: (status: StoredOrderStatus) => status !== 'processing',
    deliver: (status: StoredOrderStatus) => status !== 'processing',
    cancel: (status: StoredOrderStatus) => status === 'delivered' || status === 'cancelled',
  };

  return (
    <>
      <Toaster position="top-right" />
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
                    <Badge className={statusConfig[order.status]?.badgeClass || 'bg-gray-200 text-gray-700 border-transparent'}>
                      {statusConfig[order.status]?.label || order.status}
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
                          {/* Only show the 4 simplified statuses: pending, processing, delivered, cancelled */}
                          {(['pending', 'processing', 'delivered', 'cancelled'] as StoredOrderStatus[]).map((status) => (
                            <option key={status} value={status}>
                              {statusConfig[status]?.label}
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
              <Badge className={statusConfig[selectedOrder.status]?.badgeClass || 'bg-gray-200 text-gray-700 border-transparent'}>
                {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
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
                          src={item.image?.startsWith('//') ? `https:${item.image}` : item.image || '/placeholder.png'}
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
    </>
  );
};

export default AdminOrdersPage;



