import { db } from "../../_lib/mockData";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Chuyển id từ URL (string) sang number để tìm trong mockData (id là number)
    const productId = Number(id);

    const product = db.products.find((p) => p.id === productId);

    if (!product) {
      return NextResponse.json(
        { message: `Không tìm thấy sản phẩm với ID ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Get product detail error:", error);
    return NextResponse.json(
      { message: "Lỗi server khi lấy chi tiết sản phẩm" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);

    const index = db.products.findIndex((p) => p.id === productId);

    if (index === -1) {
      return NextResponse.json({ message: `Không tìm thấy sản phẩm` }, { status: 404 });
    }

    db.products.splice(index, 1);

    return NextResponse.json({ message: "Xóa sản phẩm thành công" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi server" }, { status: 500 });
  }
}