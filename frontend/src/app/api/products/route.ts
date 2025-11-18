import { PRODUCTS, CATEGORIES } from "../_lib/mockData";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");
    const categoryId = searchParams.get("categoryId");

    let filteredProducts = PRODUCTS;

    // Filter by categoryId if provided
    if (categoryId) {
      filteredProducts = filteredProducts.filter(
        (p) => p.categoryId === parseInt(categoryId)
      );
    }

    // If size is 0, return all products without pagination
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

    // Pagination
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
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
