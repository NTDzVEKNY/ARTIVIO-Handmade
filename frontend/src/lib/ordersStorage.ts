import type { PaymentMethod, ShippingAddress } from '@/types';

export type StoredOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type StoredOrderItem = {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
};

export type StoredOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  status: StoredOrderStatus;
  createdAt: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  items: StoredOrderItem[];
};

const ORDERS_STORAGE_KEY = 'artivio_admin_orders';

const isBrowser = () => typeof window !== 'undefined';

export function getStoredOrders(): StoredOrder[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read orders from localStorage:', error);
    return [];
  }
}

export function saveStoredOrders(orders: StoredOrder[]): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Failed to save orders to localStorage:', error);
  }
}

export function appendOrderToStorage(order: StoredOrder): StoredOrder[] {
  const current = getStoredOrders();
  const nextOrders = [...current.filter((item) => item.id !== order.id), order].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  saveStoredOrders(nextOrders);
  return nextOrders;
}

export function updateOrderStatus(orderId: number, status: StoredOrderStatus): StoredOrder[] {
  const orders = getStoredOrders();
  const nextOrders = orders.map((order) =>
    order.id === orderId
      ? {
          ...order,
          status,
        }
      : order
  );

  saveStoredOrders(nextOrders);
  return nextOrders;
}



