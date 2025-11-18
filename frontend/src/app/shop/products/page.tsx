'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

const CATEGORIES = [
  "Tất cả",
  "Đồng hồ",
  "Hoa vĩnh cửu",
  "Quà tặng",
  "Thiệp handmade",
  "Phụ kiện & nguyên liệu",
  "Vải decor",
  "Ví & passport",
  "Limited",
];

// Mock product data - replace with API call later
const MOCK_PRODUCTS = [
  { id: 1, name: "Đồng hồ treo tường gỗ", category: "Đồng hồ", price: 450000, description: "Đồng hồ treo tường làm từ gỗ tự nhiên, thiết kế cổ điển", image: "/hero-handmade.jpg" },
  { id: 2, name: "Hoa hồng vĩnh cửu", category: "Hoa vĩnh cửu", price: 280000, description: "Hoa hồng vĩnh cửu được bảo quản đặc biệt, giữ được vẻ đẹp lâu dài", image: "/hero-handmade.jpg" },
  { id: 3, name: "Bộ quà tặng handmade", category: "Quà tặng", price: 350000, description: "Bộ quà tặng handmade đầy đủ, phù hợp cho mọi dịp", image: "/hero-handmade.jpg" },
  { id: 4, name: "Thiệp chúc mừng sinh nhật", category: "Thiệp handmade", price: 50000, description: "Thiệp chúc mừng sinh nhật được làm thủ công, độc đáo", image: "/hero-handmade.jpg" },
  { id: 5, name: "Bộ phụ kiện trang trí", category: "Phụ kiện & nguyên liệu", price: 120000, description: "Bộ phụ kiện trang trí đa dạng, chất lượng cao", image: "/hero-handmade.jpg" },
  { id: 6, name: "Vải decor hoa văn", category: "Vải decor", price: 180000, description: "Vải decor với hoa văn độc đáo, phù hợp trang trí nội thất", image: "/hero-handmade.jpg" },
  { id: 7, name: "Ví da passport", category: "Ví & passport", price: 320000, description: "Ví da passport thủ công, thiết kế sang trọng", image: "/hero-handmade.jpg" },
  { id: 8, name: "Bộ sưu tập Limited Edition", category: "Limited", price: 850000, description: "Bộ sưu tập giới hạn, độc quyền và đặc biệt", image: "/hero-handmade.jpg" },
  { id: 9, name: "Đồng hồ để bàn vintage", category: "Đồng hồ", price: 380000, description: "Đồng hồ để bàn phong cách vintage, sang trọng", image: "/hero-handmade.jpg" },
  { id: 10, name: "Hoa cẩm chướng vĩnh cửu", category: "Hoa vĩnh cửu", price: 250000, description: "Hoa cẩm chướng vĩnh cửu nhiều màu sắc", image: "/hero-handmade.jpg" },
  { id: 11, name: "Thiệp cảm ơn handmade", category: "Thiệp handmade", price: 40000, description: "Thiệp cảm ơn được làm thủ công tinh xảo", image: "/hero-handmade.jpg" },
  { id: 12, name: "Ví da mini cao cấp", category: "Ví & passport", price: 290000, description: "Ví da mini cao cấp, thiết kế gọn nhẹ", image: "/hero-handmade.jpg" },
];

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam && CATEGORIES.includes(categoryParam) ? categoryParam : "Tất cả"
  );

  useEffect(() => {
    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const filteredProducts = selectedCategory === "Tất cả" 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(product => product.category === selectedCategory);

  return (
    <main className="container mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cửa hàng</h1>
        <p className="text-gray-600">Khám phá bộ sưu tập sản phẩm thủ công của chúng tôi</p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                if (category === "Tất cả") {
                  router.push('/shop/products');
                } else {
                  router.push(`/shop/products?category=${encodeURIComponent(category)}`);
                }
              }}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-[#0f172a] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-gray-600">
        Tìm thấy <span className="font-semibold">{filteredProducts.length}</span> sản phẩm
        {selectedCategory !== "Tất cả" && ` trong danh mục "${selectedCategory}"`}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/shop/id/${product.id}`}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 group"
            >
              <div className="relative w-full h-48 bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                <h3 className="text-sm font-medium mb-1 line-clamp-2 group-hover:text-[#0f172a] transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 mb-3">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#0f172a]">
                    ₫{product.price.toLocaleString("vi-VN")}
                  </div>
                  <div className="text-xs bg-[#0f172a] text-white px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Chi tiết →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-600">Hãy thử chọn danh mục khác</p>
        </div>
      )}
    </main>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white">
      <Header />
      <Suspense fallback={
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-16">
            <div className="text-lg text-gray-600">Đang tải...</div>
          </div>
        </main>
      }>
        <ProductsPageContent />
      </Suspense>
      <Footer />
    </div>
  );
}

