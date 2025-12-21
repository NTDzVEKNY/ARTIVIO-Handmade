import { NextRequest, NextResponse } from "next/server";
import { getServerAxios } from "@/lib/serverAxios";
import axios from "axios";

// Mapping với: GET /api/orders/custom-progress
export async function GET(request: NextRequest) {
  try {
    const serverAxios = await getServerAxios();

    const response = await serverAxios.get('/orders/custom-progress');

    return NextResponse.json(response.data);

  } catch (error: unknown) {
    console.error("Lỗi lấy tiến độ đơn hàng:", error);
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ message: "Lỗi server khi lấy tiến độ" }, { status: 500 });
  }
}