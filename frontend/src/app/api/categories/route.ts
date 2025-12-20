import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET() {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { error: "API base URL is not configured" },
      { status: 500 }
    );
  }

  try {
    const backendUrl = `${API_BASE_URL}/api/category`;
    const response = await fetch(backendUrl, { cache: 'no-store' });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error("Backend API error fetching categories:", errorData);
      return NextResponse.json(
        { error: `Failed to fetch from backend: ${errorData.message}` },
        { status: response.status }
      );
    }

    const categories = await response.json();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}