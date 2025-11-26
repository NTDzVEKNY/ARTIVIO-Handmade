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
        <h2 className="text-3xl font-bold mb-2" style={{ color: '#3F2E23' }}>Danh mục nổi bật</h2>
        <div className="h-1 w-20 rounded-full" style={{ backgroundColor: '#D96C39' }}></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link 
            key={category.categoryId} 
            href={`/shop/products?categoryId=${category.categoryId}`}
            className="group relative block"
          >
            <div className="absolute inset-0 rounded-2xl transform group-hover:scale-105 transition-transform duration-300 -z-10" style={{ backgroundColor: 'rgba(217, 108, 57, 0.08)' }}></div>
            
            <div className="rounded-2xl shadow-sm p-6 flex flex-col items-center text-center transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-2" style={{ backgroundColor: '#F7F1E8' }}>
              <div className="w-24 h-24 rounded-full mb-4 flex items-center justify-center text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" style={{ backgroundColor: '#F4C27A', opacity: 0.6 }}>
                {categoryIcons[category.categoryName] || '🎁'}
              </div>

              <h3 className="text-lg font-semibold group-hover:font-bold transition-all duration-300" style={{ color: '#3F2E23' }}>
                {category.categoryName}
              </h3>

              <div className="text-sm mt-2" style={{ color: '#6B4F3E' }}>
                Đã bán: <span className="font-semibold" style={{ color: '#D96C39' }}>{category.soldCount ?? 0}</span>
              </div>

              <div className="h-0.5 w-0 rounded-full mt-3 group-hover:w-12 transition-all duration-300" style={{ backgroundColor: '#D96C39' }}></div>

              <div className="mt-3 transition-colors duration-300 transform group-hover:translate-x-1" style={{ color: '#D96C39' }}>
                →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}