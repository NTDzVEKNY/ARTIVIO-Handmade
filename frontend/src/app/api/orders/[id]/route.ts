import { NextRequest, NextResponse } from "next/server";
import { getServerAxios } from "@/lib/serverAxios";
import axios from "axios";

type RouteParams = { params: { id: string } };

// 1. XEM CHI TIẾT (Mapping với GET /api/orders/{id})
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const serverAxios = await getServerAxios();
    const response = await serverAxios.get(`/orders/${params.id}`);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
        return NextResponse.json({ message: "Không tìm thấy đơn hàng" }, { status: 404 });
    }
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}

// 2. XÓA ĐƠN (Mapping với DELETE /api/orders/{id})
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const serverAxios = await getServerAxios();
    const response = await serverAxios.delete(`/orders/${params.id}`);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    return NextResponse.json({ message: "Lỗi khi xóa đơn" }, { status: 500 });
  }
}