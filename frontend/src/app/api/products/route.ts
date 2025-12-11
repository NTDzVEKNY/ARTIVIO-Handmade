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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Giả lập tạo ID mới (Lấy ID lớn nhất hiện tại + 1)
    const newId = db.products.length > 0 ? Math.max(...db.products.map((p) => Number(p.id))) + 1 : 1;

    // Tìm categoryName dựa trên categoryId gửi lên
    const category = db.categories.find(c => c.categoryId === Number(body.categoryId));

    const newProduct = {
      ...body,
      id: newId,
      // Đảm bảo các trường bắt buộc có giá trị mặc định nếu thiếu
      productName: body.productName || "Sản phẩm mới",
      price: String(body.price),
      image: body.image || "https://placehold.co/600x400?text=No+Image",
      quantitySold: 0,
      stockQuantity: Number(body.stockQuantity),
      categoryId: Number(body.categoryId),
      categoryName: category ? category.categoryName : 'Khác',
      status: body.status || 'Đang bán',
      createdAt: new Date().toISOString(),
    };

    // Thêm vào đầu danh sách giả lập
    db.products.unshift(newProduct as Product);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
