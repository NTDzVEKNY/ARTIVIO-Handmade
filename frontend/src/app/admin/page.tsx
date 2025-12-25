'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchApi } from '@/services/api';
import { Loader2, TrendingUp, Package, ShoppingCart, Users, DollarSign, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import type { RawAdminOrderList } from '@/types/apiTypes';
import type { StoredOrder, StoredOrderStatus } from '@/lib/ordersStorage';
import { mapBackendToFrontendStatus } from '@/utils/orderStatusMapper';
import { PaginatedProductResponse } from '@/types/apiTypes';
import type { PaymentMethod } from '@/types';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

  const normalizeStatus = (status: StoredOrderStatus): StoredOrderStatus => {
    if (status === 'confirmed') return 'pending';
    if (status === 'shipped') return 'processing';
    return status;
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
      email: '',
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

const statusConfig: Partial<Record<
  StoredOrderStatus,
  { label: string; badgeClass: string }
>> = {
  pending: {
    label: 'Chờ xử lý',
    badgeClass: 'bg-gray-200 text-gray-700 border-transparent',
  },
  processing: {
    label: 'Đang xử lý',
    badgeClass: 'bg-orange-100 text-orange-700 border-transparent',
  },
  delivered: {
    label: 'Đã giao',
    badgeClass: 'bg-green-100 text-green-700 border-transparent',
  },
  cancelled: {
    label: 'Đã hủy',
    badgeClass: 'bg-red-100 text-red-700 border-transparent',
  },
};

const AdminDashboard = () => {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch orders and products in parallel
        const [ordersData, productsData] = await Promise.all([
          fetchApi<RawAdminOrderList[]>('/orders/admin/all').catch(() => []),
          fetchApi<PaginatedProductResponse>('/products?admin=true&page=0&size=1000').catch(() => ({ content: [], totalElements: 0 })),
        ]);

        const mappedOrders = ordersData.map(mapAdminOrderToStoredOrder);
        setOrders(mappedOrders);
        setProducts(productsData.content || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Không thể tải dữ liệu dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'ACTIVE').length;
    
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

    // Calculate revenue for delivered orders only
    const deliveredRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);

    // Calculate today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = orders
      .filter(o => {
        const orderDate = new Date(o.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime() && o.status !== 'cancelled';
      })
      .reduce((sum, order) => sum + order.total, 0);

    // Calculate this month's revenue
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthRevenue = orders
      .filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= startOfMonth && o.status !== 'cancelled';
      })
      .reduce((sum, order) => sum + order.total, 0);

    return {
      totalOrders,
      totalRevenue,
      deliveredRevenue,
      todayRevenue,
      monthRevenue,
      totalProducts,
      activeProducts,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
    };
  }, [orders, products]);

  // Get recent orders (last 5)
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  // Get top selling products
  const topProducts = useMemo(() => {
    const productSales = new Map<number, { name: string; image: string | null; quantity: number; revenue: number }>();
    
    orders.forEach(order => {
      if (order.status !== 'cancelled') {
        order.items.forEach(item => {
          const existing = productSales.get(item.productId) || {
            name: item.productName,
            image: item.image || null,
            quantity: 0,
            revenue: 0,
          };
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;
          productSales.set(item.productId, existing);
        });
      }
    });

    return Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  // Prepare data for order status pie chart
  const orderStatusChartData = useMemo(() => {
    return [
      { name: 'Chờ xử lý', value: stats.pendingOrders, color: '#9CA3AF' },
      { name: 'Đang xử lý', value: stats.processingOrders, color: '#F4C27A' },
      { name: 'Đã giao', value: stats.deliveredOrders, color: '#10B981' },
      { name: 'Đã hủy', value: stats.cancelledOrders, color: '#EF4444' },
    ].filter(item => item.value > 0);
  }, [stats]);

  // Prepare revenue data for last 7 days
  const revenueChartData = useMemo(() => {
    const days = 7;
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayRevenue = orders
        .filter(o => {
          const orderDate = new Date(o.createdAt);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === date.getTime() && o.status !== 'cancelled';
        })
        .reduce((sum, order) => sum + order.total, 0);
      
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === date.getTime();
      }).length;

      data.push({
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: dayRevenue,
        orders: dayOrders,
      });
    }
    
    return data;
  }, [orders]);

  // Prepare monthly revenue data for last 6 months
  const monthlyRevenueData = useMemo(() => {
    const months = 6;
    const data = [];
    const today = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      
      const monthRevenue = orders
        .filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= date && orderDate < nextMonth && o.status !== 'cancelled';
        })
        .reduce((sum, order) => sum + order.total, 0);
      
      data.push({
        month: date.toLocaleDateString('vi-VN', { month: 'short' }),
        revenue: monthRevenue,
      });
    }
    
    return data;
  }, [orders]);

  if (isLoading) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="flex items-center justify-center py-16" style={{ color: '#6B4F3E' }}>
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Đang tải dashboard...
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#3F2E23' }}>
            Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6B4F3E' }}>
            Tổng quan về hoạt động kinh doanh của bạn
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#E8D5B5] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#6B4F3E' }}>
                  Tổng đơn hàng
                </p>
                <p className="mt-2 text-3xl font-bold" style={{ color: '#3F2E23' }}>
                  {stats.totalOrders}
                </p>
                <p className="mt-1 text-xs" style={{ color: '#6B4F3E' }}>
                  {stats.pendingOrders} chờ xử lý
                </p>
              </div>
              <div className="rounded-full p-3" style={{ backgroundColor: '#FFF8F0' }}>
                <ShoppingCart className="h-6 w-6" style={{ color: '#D96C39' }} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#E8D5B5] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#6B4F3E' }}>
                  Doanh thu đã giao
                </p>
                <p className="mt-2 text-3xl font-bold" style={{ color: '#3F2E23' }}>
                  {formatCurrency(stats.deliveredRevenue)}
                </p>
                <p className="mt-1 text-xs" style={{ color: '#6B4F3E' }}>
                  {formatCurrency(stats.monthRevenue)} tháng này
                </p>
              </div>
              <div className="rounded-full p-3" style={{ backgroundColor: '#FFF8F0' }}>
                <DollarSign className="h-6 w-6" style={{ color: '#D96C39' }} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#E8D5B5] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#6B4F3E' }}>
                  Sản phẩm
                </p>
                <p className="mt-2 text-3xl font-bold" style={{ color: '#3F2E23' }}>
                  {stats.totalProducts}
                </p>
                <p className="mt-1 text-xs" style={{ color: '#6B4F3E' }}>
                  {stats.activeProducts} đang hoạt động
                </p>
              </div>
              <div className="rounded-full p-3" style={{ backgroundColor: '#FFF8F0' }}>
                <Package className="h-6 w-6" style={{ color: '#D96C39' }} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#E8D5B5] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#6B4F3E' }}>
                  Đơn đang xử lý
                </p>
                <p className="mt-2 text-3xl font-bold" style={{ color: '#3F2E23' }}>
                  {stats.pendingOrders + stats.processingOrders}
                </p>
                <p className="mt-1 text-xs" style={{ color: '#6B4F3E' }}>
                  Cần xử lý ngay
                </p>
              </div>
              <div className="rounded-full p-3" style={{ backgroundColor: '#FFF8F0' }}>
                <Activity className="h-6 w-6" style={{ color: '#D96C39' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue Trend Chart (Last 7 Days) */}
          <div className="rounded-xl border border-[#E8D5B5] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#3F2E23' }}>
              Doanh thu 7 ngày qua
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D96C39" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D96C39" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8D5B5" />
                <XAxis 
                  dataKey="date" 
                  style={{ fontSize: '12px', fill: '#6B4F3E' }}
                />
                <YAxis 
                  style={{ fontSize: '12px', fill: '#6B4F3E' }}
                  tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8F0',
                    border: '1px solid #E8D5B5',
                    borderRadius: '8px',
                    color: '#3F2E23',
                  }}
                  formatter={(value: number | undefined) => formatCurrency(value || 0)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D96C39"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Pie Chart */}
          <div className="rounded-xl border border-[#E8D5B5] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#3F2E23' }}>
              Phân bổ trạng thái đơn hàng
            </h2>
            {orderStatusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF8F0',
                      border: '1px solid #E8D5B5',
                      borderRadius: '8px',
                      color: '#3F2E23',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', color: '#6B4F3E' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-sm" style={{ color: '#6B4F3E' }}>
                  Chưa có dữ liệu đơn hàng
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Revenue and Order Trends */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Monthly Revenue Bar Chart */}
          <div className="rounded-xl border border-[#E8D5B5] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#3F2E23' }}>
              Doanh thu theo tháng (6 tháng gần nhất)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8D5B5" />
                <XAxis 
                  dataKey="month" 
                  style={{ fontSize: '12px', fill: '#6B4F3E' }}
                />
                <YAxis 
                  style={{ fontSize: '12px', fill: '#6B4F3E' }}
                  tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8F0',
                    border: '1px solid #E8D5B5',
                    borderRadius: '8px',
                    color: '#3F2E23',
                  }}
                  formatter={(value: number | undefined) => formatCurrency(value || 0)}
                />
                <Bar dataKey="revenue" fill="#D96C39" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Orders and Revenue Combined Chart */}
          <div className="rounded-xl border border-[#E8D5B5] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#3F2E23' }}>
              Đơn hàng & Doanh thu (7 ngày qua)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8D5B5" />
                <XAxis 
                  dataKey="date" 
                  style={{ fontSize: '12px', fill: '#6B4F3E' }}
                />
                <YAxis 
                  yAxisId="left"
                  style={{ fontSize: '12px', fill: '#6B4F3E' }}
                  tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  style={{ fontSize: '12px', fill: '#6B4F3E' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8F0',
                    border: '1px solid #E8D5B5',
                    borderRadius: '8px',
                    color: '#3F2E23',
                  }}
                  formatter={(value: number | string | undefined, name: string | undefined) => {
                    if (name === 'revenue') return formatCurrency((value as number) || 0);
                    return value || 0;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: '#6B4F3E' }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D96C39"
                  strokeWidth={2}
                  name="Doanh thu"
                  dot={{ fill: '#D96C39', r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#6B4F3E"
                  strokeWidth={2}
                  name="Số đơn"
                  dot={{ fill: '#6B4F3E', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-[#E8D5B5] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#3F2E23' }}>
              Doanh thu hôm nay
            </h2>
            <p className="text-3xl font-bold" style={{ color: '#3F2E23' }}>
              {formatCurrency(stats.todayRevenue)}
            </p>
          </div>
          <div className="rounded-xl border border-[#E8D5B5] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#3F2E23' }}>
              Doanh thu tháng này
            </h2>
            <p className="text-3xl font-bold" style={{ color: '#3F2E23' }}>
              {formatCurrency(stats.monthRevenue)}
            </p>
          </div>
          <div className="rounded-xl border border-[#E8D5B5] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#3F2E23' }}>
              Tổng đã giao
            </h2>
            <p className="text-3xl font-bold" style={{ color: '#3F2E23' }}>
              {formatCurrency(stats.deliveredRevenue)}
            </p>
          </div>
        </div>

        {/* Recent Orders and Top Products */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <div className="rounded-xl border border-[#E8D5B5] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: '#3F2E23' }}>
                Đơn hàng gần đây
              </h2>
              <Link href="/admin/orders">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#E8D5B5] text-[#3F2E23] hover:bg-[#FFF8F0]"
                >
                  Xem tất cả
                </Button>
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: '#6B4F3E' }}>
                  Chưa có đơn hàng nào
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border border-[#E8D5B5] p-4 hover:bg-[#FFF8F0] transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold" style={{ color: '#3F2E23' }}>
                          {order.orderNumber}
                        </p>
                        <Badge
                          className={statusConfig[order.status]?.badgeClass || 'bg-gray-200 text-gray-700 border-transparent'}
                        >
                          {statusConfig[order.status]?.label || order.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm" style={{ color: '#6B4F3E' }}>
                        {order.customerName} • {formatCurrency(order.total)}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: '#6B4F3E' }}>
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <Link href="/admin/orders">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#E8D5B5] text-[#3F2E23] hover:bg-[#FFF8F0]"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="rounded-xl border border-[#E8D5B5] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: '#3F2E23' }}>
                Sản phẩm bán chạy
              </h2>
              <Link href="/admin/products">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#E8D5B5] text-[#3F2E23] hover:bg-[#FFF8F0]"
                >
                  Xem tất cả
                </Button>
              </Link>
            </div>
            {topProducts.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm" style={{ color: '#6B4F3E' }}>
                  Chưa có sản phẩm nào được bán
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-lg border border-[#E8D5B5] p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF8F0] font-bold" style={{ color: '#D96C39' }}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: '#3F2E23' }}>
                        {product.name}
                      </p>
                      <p className="text-sm" style={{ color: '#6B4F3E' }}>
                        {product.quantity} sản phẩm • {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
