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
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?limit=8')
      .then(res => res.json())
      .then((data: Product[] | { content: Product[] }) => {
        // API có thể trả về { content: [...] } hoặc [...]
        const productList = 'content' in data && Array.isArray(data.content) ? data.content : data;
        setProducts(Array.isArray(productList) ? productList : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch featured products:", err);
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
            <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/shop/id/${product.id}`}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 group"
            >
              <div className="relative w-full h-48 bg-gray-100">
                <Image src={product.image} alt={product.productName} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium group-hover:text-[#0f172a] transition-colors truncate">{product.productName}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#0f172a]">₫{Number(product.price).toLocaleString("vi-VN")}</div>
                  <div className="text-sm bg-[#0f172a] text-white px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Chi tiết →
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