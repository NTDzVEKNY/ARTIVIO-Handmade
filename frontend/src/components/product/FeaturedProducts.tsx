'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  productName: string;
  price: string;
  image: string;
  description: string;
  quantitySold?: number;
  categoryName?: string;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch full product list, sort by quantitySold desc, take top 8
    fetch('/api/products?size=0')
      .then(res => res.json())
      .then((data: Product[] | { content: Product[] }) => {
        const productList = Array.isArray(data) ? data : (data.content ?? []);
        const normalized = Array.isArray(productList) ? productList : [];
        normalized.sort((a, b) => (Number(b.quantitySold ?? 0) - Number(a.quantitySold ?? 0)));
        setProducts(normalized.slice(0, 8));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch featured products:", err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sản phẩm nổi bật</h2>
        <Link href="/shop/products" className="text-sm text-gray-600 hover:text-[#0f172a] transition-colors">Xem tất cả →</Link>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {products.map((product, idx) => (
            <Link
              key={product.id}
              href={`/shop/id/${product.id}`}
              className="group relative"
            >
              <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-yellow-100 hover:border-orange-400 h-full flex flex-col"
                style={{ animation: `fadeInUp 0.45s ease-out ${idx * 0.04}s backwards` }}
              >
                <div className="relative w-full h-44 bg-gradient-to-br from-yellow-100 to-orange-100 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.productName}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.quantitySold && product.quantitySold > 0 && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      ⭐ Bán chạy
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">
                    {product.categoryName ?? ''}
                  </div>
                  <h3 className="text-sm font-bold mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors text-gray-900">
                    {product.productName}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2 mb-4 flex-grow">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t-2 border-yellow-100">
                    <div className="text-lg font-bold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
                      ₫{Number(product.price).toLocaleString("vi-VN")}
                    </div>
                    <div className="text-xs bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-2 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
                      Xem →
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}