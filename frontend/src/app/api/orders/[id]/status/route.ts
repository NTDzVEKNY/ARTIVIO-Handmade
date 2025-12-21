import { NextRequest, NextResponse } from "next/server";
import { getServerAxios } from "@/lib/serverAxios";
import axios from "axios";

type RouteParams = { params: { id: string } };

// Mapping với: PUT /api/orders/{id}/status?status=SHIPPED
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const serverAxios = await getServerAxios();

    // 1. Lấy trạng thái mới từ Body JSON mà Client gửi lên
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ message: "Thiếu trạng thái (status)" }, { status: 400 });
    }

    // 2. Gọi sang Java
    const response = await serverAxios.put(`/orders/${params.id}/status?status=${status}`);

    return NextResponse.json(response.data);

  } catch (error: unknown) {
    console.error("Lỗi cập nhật trạng thái:", error);
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: "Lỗi server khi cập nhật trạng thái" }, { status: 500 });
  }
}