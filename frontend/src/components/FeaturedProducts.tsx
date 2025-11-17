import Image from "next/image";
import Link from "next/link";

export default function FeaturedProducts() {
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sản phẩm nổi bật</h2>
        <Link href="#" className="text-sm text-gray-600">Xem tất cả →</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <article key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="relative w-full h-48 bg-gray-100">
              <Image src={`/product-${(i % 4) + 1}.jpg`} alt={`Product ${i + 1}`} fill className="object-cover" />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium">Sản phẩm {(i + 1)}</h3>
              <p className="text-xs text-gray-500 mt-1">Mô tả ngắn gọn về sản phẩm</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-sm font-semibold">₫{(150000 + i * 25000).toLocaleString("vi-VN")}</div>
                <Link href="#" className="text-sm bg-[#0f172a] text-white px-3 py-1 rounded-full">Chi tiết</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}