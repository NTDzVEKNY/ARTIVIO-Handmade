import { db } from "../../_lib/mockData";
import { NextRequest, NextResponse } from "next/server";

type ParamsLike = Record<string, string | Promise<string>>;

export async function GET(
  request: NextRequest,
  { params }: { params: ParamsLike }
) {
  try {
    // PHƯƠNG PHÁP KHÁC: Lấy ID trực tiếp từ URL để tránh lỗi phân tích của Next.js
    const pathname = new URL(request.url).pathname; // Ví dụ: "/api/products/184102"
    const segments = pathname.split('/'); // Ví dụ: ["", "api", "products", "184102"]
    const idString = segments[segments.length - 1]; // Lấy phần tử cuối cùng

    if (!idString) {
      return NextResponse.json({ error: "Product ID is missing from URL" }, { status: 400 });
    }

    const id = parseInt(idString);

    const product = db.products.find((p) => p.id === id);

    if (product) {
      return NextResponse.json(product);
    } else {
      return NextResponse.json({ error: `Product with id ${id} not found` }, { status: 404 });
    }
  } catch (error) {
    console.error(`Failed to fetch product:`, error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}