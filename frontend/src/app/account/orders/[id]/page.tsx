"use client";
import React, { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { fetchApi } from '@/services/api';
import OrderDetail from '@/components/order/OrderDetail';
import type { OrderDetailData } from '@/types';

const OrderDetailPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState<OrderDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            const fetchOrder = async () => {
                try {
                    const orderId = Array.isArray(id) ? id[0] : id;
                    const foundOrder = await fetchApi<OrderDetailData>(`/api/orders?orderId=${orderId}`);
                    setOrder(foundOrder);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'An unknown error occurred');
                } finally {
                    setLoading(false);
                }
            };
            fetchOrder();
        }
    }, [id]);

    if (loading) {
        return <div className="container mx-auto px-4 py-8">Đang tải...</div>;
    }

    if (error) {
        return <div className="container mx-auto px-4 py-8 text-red-500">Lỗi: {error}</div>;
    }

    if (!order) {
        // notFound() will be triggered if the API returns a 404, which fetchApi should throw an error for.
        // This handles cases where the order is null for other reasons.
        return notFound();
    }

    return <OrderDetail order={order} />;
};

export default OrderDetailPage;
