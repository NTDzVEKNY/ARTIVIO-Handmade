"use client";
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { fetchApi } from '@/services/api';
import Link from 'next/link';

// This type should match the structure returned by `GET /api/orders?userId=...`
type ApiOrder = {
  id: number;
  created_at: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  total_price: number;
  items: {
    product_name: string;
    quantity: number;
  }[];
}

const statusConfig: Record<string, { label: string; badgeClass: string; }> = {
  PENDING: { label: 'Chờ xử lý', badgeClass: 'bg-gray-200 text-gray-700 border-transparent' },
  IN_PROGRESS: { label: 'Đang xử lý', badgeClass: 'bg-blue-100 text-blue-700 border-transparent' },
  COMPLETED: { label: 'Hoàn thành', badgeClass: 'bg-green-100 text-green-700 border-transparent' },
  CANCELLED: { label: 'Đã hủy', badgeClass: 'bg-red-100 text-red-700 border-transparent' },
};

const formatCurrency = (value: number) => `₫${value.toLocaleString('vi-VN')}`;

const OrdersPage = () => {
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();
    const [orders, setOrders] = useState<ApiOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchOrders = async () => {
        if (sessionStatus === 'authenticated' && session?.user?.email) {
          try {
            const data = await fetchApi<ApiOrder[]>(`/orders?email=${session.user.email}`);
            setOrders(data);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
          } finally {
            setLoading(false);
          }
        }
        if (sessionStatus === 'unauthenticated') {
           setLoading(false);
        }
      };

      fetchOrders();
    }, [sessionStatus, session]);

    const handleRowClick = (orderId: number) => {
        router.push(`/account/orders/${orderId}`);
    };

    if (loading || sessionStatus === 'loading') {
        return <div className="container mx-auto px-4 py-8 text-center">Đang tải...</div>;
    }

    if (sessionStatus === 'unauthenticated') {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-lg font-semibold text-gray-700">Vui lòng đăng nhập</p>
                <p className="mt-2 text-sm text-gray-500">
                    Bạn cần đăng nhập để xem lịch sử đơn hàng của mình.
                </p>
                <Link href="/login" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
                    Đi đến trang đăng nhập
                </Link>
            </div>
        );
    }

    if (error) {
        return <div className="container mx-auto px-4 py-8 text-center text-red-500">Lỗi: {error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Đơn hàng của tôi</h1>
            {orders.length === 0 ? (
                 <div className="rounded-lg border border-dashed border-gray-200 p-10 text-center">
                    <p className="text-lg font-semibold text-gray-700">
                        Bạn chưa có đơn hàng nào
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        Hãy bắt đầu mua sắm và theo dõi đơn hàng của bạn tại đây!
                    </p>
                 </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Mã đơn hàng</TableHead>
                                <TableHead>Ngày đặt</TableHead>
                                <TableHead>Các mặt hàng</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Tổng tiền</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id} onClick={() => handleRowClick(order.id)} className="cursor-pointer hover:bg-gray-50">
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{new Date(order.created_at).toLocaleDateString('vi-VN')}</TableCell>
                                    <TableCell className="max-w-[300px] truncate">
                                        {order.items.map(item => item.product_name).join(', ')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={statusConfig[order.status]?.badgeClass || 'bg-gray-100'}>
                                            {statusConfig[order.status]?.label || order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">{formatCurrency(order.total_price)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;