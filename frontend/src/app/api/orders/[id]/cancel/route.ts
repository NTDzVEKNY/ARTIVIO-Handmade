import { NextRequest, NextResponse } from "next/server";
import { getServerAxios } from "@/lib/serverAxios";

// HỦY ĐƠN (Mapping với PUT /api/orders/{id}/cancel)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serverAxios = await getServerAxios();

    const response = await serverAxios.put(`/orders/${params.id}/cancel`);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    return NextResponse.json({ message: "Lỗi hủy đơn" }, { status: 500 });
  }
}