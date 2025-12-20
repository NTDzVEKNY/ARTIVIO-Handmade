import { NextRequest, NextResponse } from "next/server";
import { getServerAxios } from "@/lib/serverAxios";
import axios from "axios";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  
  if (!id) {
    return NextResponse.json({ error: "Product ID is missing" }, { status: 400 });
  }

  try {
    const serverAxios = await getServerAxios();
    const response = await serverAxios.get(`/products/${id}`);
    
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    console.error(`Failed to fetch product ${id}:`, error);
    // Trả về lỗi từ axios nếu có
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}