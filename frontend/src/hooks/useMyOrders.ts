"use client";

import { useState, useEffect, useCallback } from "react";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { RawOrderResponse } from "@/types/apiTypes";
import toast from "react-hot-toast";

const useMyOrders = () => {
    const axiosAuth = useAxiosAuth();
    const [orders, setOrders] = useState<RawOrderResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Endpoint: GET /api/orders/my-orders
    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axiosAuth.get<RawOrderResponse[]>("/orders/my-orders");
            setOrders(response.data);
            setError(null);
        } catch (err) {
            console.error("Lỗi tải đơn hàng:", err);
            setError("Không thể tải lịch sử đơn hàng.");
        } finally {
            setIsLoading(false);
        }
    }, [axiosAuth]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Endpoint: PUT /api/orders/{id}/cancel
    const cancelOrder = async (orderId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

        try {
            await axiosAuth.put(`/orders/${orderId}/cancel`);
            toast.success("Hủy đơn hàng thành công!");

            // Cập nhật UI ngay lập tức mà không cần gọi lại API
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, status: "CANCELLED" } : order
                )
            );
        } catch (err) {
            const message = (err as any)?.response?.data?.message || "Lỗi khi hủy đơn hàng";
            toast.error(message);
        }
    };

    return { orders, isLoading, error, cancelOrder, refetch: fetchOrders };
};

export default useMyOrders;