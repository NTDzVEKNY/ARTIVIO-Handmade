import { NextRequest, NextResponse } from "next/server";
import { createProduct, ProductPayload } from "@/services/adminApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { error: "API base URL is not configured" },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const backendUrl = `${API_BASE_URL}/api/products?${searchParams.toString()}`;
    
    const response = await fetch(backendUrl, { cache: 'no-store' });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error("Backend API error fetching products:", errorData);
      return NextResponse.json(
        { error: `Failed to fetch from backend: ${errorData.message}` },
        { status: response.status }
      );
    }

    const products = await response.json();
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ProductPayload = await request.json();
    const newProduct = await createProduct(body);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
