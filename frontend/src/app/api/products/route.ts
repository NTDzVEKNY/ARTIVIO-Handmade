import { NextRequest, NextResponse } from "next/server";
import { getServerAxios } from "@/lib/serverAxios";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const serverAxios = await getServerAxios();
    const { searchParams } = new URL(request.url);
    
    // Chuyển tiếp các search params tới backend
    const response = await serverAxios.get('/products', {
      params: Object.fromEntries(searchParams.entries()),
    });
    
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: unknown) {
    console.error("Failed to fetch products:", error);
    // Trả về lỗi từ axios nếu có
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const serverAxios = await getServerAxios();
    const body = await request.json();
    const response = await serverAxios.post('/products', body);
    
    return NextResponse.json(response.data, { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to create product:", error);
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
