'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";

interface Category {
  categoryId: number;
  categoryName: string;
  soldCount?: number;
}

const categoryIcons: { [key: string]: string } = {
  "Đồng hồ": "🕰️",
  "Hoa vĩnh cửu": "🌹",
  "Quà tặng": "🎁",
  "Thiệp handmade": "💌",
  "Phụ kiện & nguyên liệu": "🧵",
  "Vải decor": "🎨",
  "Ví & passport": "💼",
  "Limited": "🌟",
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // fetch both categories and products to compute sold counts per category
    Promise.all([fetch('/api/categories'), fetch('/api/products?size=0')])
      .then(async ([cRes, pRes]) => {
        type CatRes = { categoryId: number; categoryName: string };
        type ProdRes = { categoryId?: number | string; quantitySold?: number | string; sold?: number | string };

        const catsRaw = await cRes.json();
        const productsRaw = await pRes.json();

        const cats: CatRes[] = Array.isArray(catsRaw) ? catsRaw as CatRes[] : [];

        let products: ProdRes[] = [];
        if (Array.isArray(productsRaw)) {
          products = productsRaw as ProdRes[];
        } else if (productsRaw && typeof productsRaw === 'object' && 'content' in productsRaw && Array.isArray((productsRaw as { content?: unknown }).content)) {
          products = (productsRaw as { content: ProdRes[] }).content;
        } else {
          products = [];
        }

        // compute sold sums by categoryId
        const soldMap = new Map<number, number>();
        for (const p of products) {
          const cid = typeof p.categoryId === 'number' ? p.categoryId : Number(p.categoryId ?? 0);
          const sold = Number(p.quantitySold ?? p.sold ?? 0) || 0;
          soldMap.set(cid, (soldMap.get(cid) ?? 0) + sold);
        }

        const enriched: Category[] = cats.map((c) => ({
          categoryId: c.categoryId,
          categoryName: c.categoryName,
          soldCount: soldMap.get(Number(c.categoryId)) ?? 0,
        }));

        // sort by soldCount desc and take top 4
        enriched.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
        setCategories(enriched.slice(0, 4));
      })
      .catch(err => {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      });
  }, []);


  return (
    <section className="mt-16 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Danh mục nổi bật</h2>
        <div className="h-1 w-16 bg-gradient-to-r from-orange-400 to-yellow-300 rounded-full mt-2"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.categoryId} 
            href={`/shop/products?categoryId=${category.categoryId}`}
            className="group relative block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 to-yellow-200/20 rounded-2xl transform group-hover:scale-105 transition-transform duration-300 -z-10"></div>
            
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full mb-4 flex items-center justify-center text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                {categoryIcons[category.categoryName] || '🎁'}
              </div>

              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                {category.categoryName}
              </h3>

              <div className="text-sm text-gray-500 mt-2">
                Đã bán: <span className="font-semibold text-orange-600">{category.soldCount ?? 0}</span>
              </div>

              <div className="h-0.5 w-0 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full mt-3 group-hover:w-12 transition-all duration-300"></div>

              <div className="mt-3 text-gray-400 group-hover:text-orange-500 transition-colors duration-300 transform group-hover:translate-x-1 transition-transform duration-300">
                →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}