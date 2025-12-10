import { db } from "../_lib/mockData";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Trả về dữ liệu danh mục gốc để đảm bảo tính nhất quán trên toàn bộ ứng dụng.
    // Các component frontend sẽ sử dụng thuộc tính `categoryId` và `categoryName`.
    return NextResponse.json(db.categories, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}