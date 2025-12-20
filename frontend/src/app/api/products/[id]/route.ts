import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = params;

  if (!API_BASE_URL) {
    return NextResponse.json(
      { error: "API base URL is not configured" },
      { status: 500 }
    );
  }

  if (!id) {
    return NextResponse.json({ error: "Product ID is missing" }, { status: 400 });
  }

  try {
    const backendUrl = `${API_BASE_URL}/api/products/${id}`;
    const response = await fetch(backendUrl, { cache: 'no-store' });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`Backend API error fetching product ${id}:`, errorData);
      return NextResponse.json(
        { error: `Failed to fetch from backend: ${errorData.message}` },
        { status: response.status }
      );
    }

    const product = await response.json();
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}