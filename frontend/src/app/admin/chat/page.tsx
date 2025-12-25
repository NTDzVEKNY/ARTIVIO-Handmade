// frontend/src/app/admin/chat/page.tsx
"use client";

import React from "react";
import useAllChats from "@/hooks/useAllChats";
import { DataTable } from "@/components/ui/data-table"; // Sử dụng component DataTable chung của project
import { columns } from "./column";
import { Loader2 } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export default function AdminChatManagementPage() {
    const { chatDataDetails, isLoading, error } = useAllChats();

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title={`Quản lý Chat (${chatDataDetails?.length || 0})`}
                        description="Theo dõi và phản hồi tất cả các yêu cầu tùy chỉnh của khách hàng."
                    />
                </div>
                <Separator />

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-500 mb-2" />
                        <p className="text-slate-500">Đang tải dữ liệu hội thoại...</p>
                    </div>
                ) : error ? (
                    <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg">
                        {error}
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={chatDataDetails}
                        searchKey="title" // Cho phép tìm kiếm theo tiêu đề chat
                    />
                )}
            </div>
        </div>
    );
}