"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

// Helper xử lý ảnh đã có của bạn
const getProductImageUrl = (imagePath?: string | null) => {
    if (!imagePath) return '/artivio-logo.png';
    if (imagePath.startsWith('//')) return `https:${imagePath}`;
    if (imagePath.startsWith('http')) return imagePath;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    return `${apiUrl}${imagePath}`;
};

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "chat.id",
        header: "ID",
    },
    {
        id: "productImage",
        header: "Ảnh",
        cell: ({ row }) => (
            <div className="h-10 w-10 relative rounded overflow-hidden border">
                <Image
                    src={getProductImageUrl(row.original.product?.image)}
                    alt="Product"
                    fill
                    className="object-cover"
                />
            </div>
        ),
    },
    {
        id: "title",
        header: "Tiêu đề yêu cầu",
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate font-medium">
                {row.original.chat.title}
            </div>
        ),
    },
    {
        id: "customer",
        header: "Khách hàng",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-sm font-semibold">{row.original.customer?.name || "N/A"}</span>
                <span className="text-xs text-slate-500">{row.original.customer?.email}</span>
            </div>
        ),
    },
    {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
            const status = row.original.chat.status;
            const statusMap: Record<string, { label: string; className: string }> = {
                PENDING: { label: "Đang chờ", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
                IN_PROGRESS: { label: "Đang xử lý", className: "bg-blue-100 text-blue-800 border-blue-200" },
                COMPLETED: { label: "Hoàn thành", className: "bg-green-100 text-green-800 border-green-200" },
            };
            const config = statusMap[status] || { label: status, className: "bg-gray-100" };
            return (
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${config.className}`}>
                    {config.label}
                </span>
            );
        },
    },
    {
        id: "createdAt",
        header: "Ngày tạo",
        cell: ({ row }) => formatDate(row.original.chat.created_at),
    },
    {
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => (
            <Link href={`/admin/chat/${row.original.chat.id}`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </Link>
        ),
    },
];