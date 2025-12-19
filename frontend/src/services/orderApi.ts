import type { Order } from '@/types';
import { fetchApi } from './api';

/**
 * Fetches all orders for a given user.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of orders.
 */
export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    return fetchApi<Order[]>(`/orders?userId=${userId}`);
};

/**
 * Fetches a single order by its ID.
 * @param orderId - The ID of the order.
 * @returns A promise that resolves to the order.
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
    return fetchApi<Order>(`/orders/${orderId}`);
};
