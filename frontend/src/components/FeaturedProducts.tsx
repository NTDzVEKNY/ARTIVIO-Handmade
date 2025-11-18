import Image from "next/image";
import Link from "next/link";

export default function FeaturedProducts() {
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sản phẩm nổi bật</h2>
        <Link href="/shop/products" className="text-sm text-gray-600 hover:text-[#0f172a] transition-colors">Xem tất cả →</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {Array.from({ length: 8 }).map((_, i) => {
          const productId = i + 1;
          return (
            <Link 
              key={i} 
              href={`/shop/id/${productId}`}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 group"
            >
              <div className="relative w-full h-48 bg-gray-100">
                <Image src="/hero-handmade.jpg" alt={`Product ${productId}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium group-hover:text-[#0f172a] transition-colors">Sản phẩm {productId}</h3>
                <p className="text-xs text-gray-500 mt-1">Mô tả ngắn gọn về sản phẩm</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#0f172a]">₫{(150000 + i * 25000).toLocaleString("vi-VN")}</div>
                  <div className="text-sm bg-[#0f172a] text-white px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Chi tiết →
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}