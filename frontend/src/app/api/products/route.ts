import { db } from "../_lib/mockData";
import { NextRequest, NextResponse } from "next/server";

// Định nghĩa kiểu dữ liệu cho một sản phẩm để code an toàn hơn
type Product = typeof db.products[0];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // Khởi tạo một biến có thể thay đổi để chứa kết quả lọc
    let filteredProducts = [...db.products];

    // Lọc theo categoryId
    const categoryId = searchParams.get("categoryId");

    // Filter by categoryId if provided
    if (categoryId) {
      filteredProducts = filteredProducts.filter((p: Product) => 
        p.categoryId === parseInt(categoryId)
      );
    }

    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");

    // Nếu size là 0, trả về tất cả sản phẩm không phân trang
    if (size === 0) {
      const response = {
        content: filteredProducts,
        totalElements: filteredProducts.length,
        totalPages: 1,
        currentPage: 0,
        size: filteredProducts.length,
      };
      return NextResponse.json(response, { status: 200 });
    }

    // Phân trang
    const start = page * size;
    const end = start + size;
    const paginatedProducts = filteredProducts.slice(start, end);

    const response = {
      content: paginatedProducts,
      totalElements: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / size),
      currentPage: page,
      size: size,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
