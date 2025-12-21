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

// 2. CẬP NHẬT
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "Product ID is missing" }, { status: 400 });

  try {
    const serverAxios = await getServerAxios();
    const body = await request.json();

    // Gọi Java: PUT /products/{id}
    const response = await serverAxios.put(`/products/${id}`, body);

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    console.error(`Failed to update product ${id}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// 3. XÓA
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "Product ID is missing" }, { status: 400 });

  try {
    const serverAxios = await getServerAxios();

    // Gọi Java: DELETE /products/{id}
    const response = await serverAxios.delete(`/products/${id}`);

    return NextResponse.json({ message: response.data }, { status: 200 });
  } catch (error: unknown) {
    console.error(`Failed to delete product ${id}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}