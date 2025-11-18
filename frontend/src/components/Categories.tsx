'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";

interface Category {
  categoryId: number;
  categoryName: string;
}

const categoryIcons: { [key: string]: string } = {
  "Đồng hồ": "🕰️",
  "Hoa vĩnh cửu": "🌹",
  "Quà tặng": "🎁",
  "Thiệp handmade": "💌",
  "Phụ kiện & nguyên liệu": "✨",
  "Vải decor": "🎨",
  "Ví & passport": "💼",
  "Limited": "🌟",
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.slice(0, 4))) // Only show 4 categories
      .catch(err => console.error("Failed to fetch categories:", err));
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
              {/* Icon background */}
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full mb-4 flex items-center justify-center text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                {categoryIcons[category.categoryName] || '🎁'}
              </div>

              {/* Category name */}
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                {category.categoryName}
              </h3>

              {/* Hover effect - underline */}
              <div className="h-0.5 w-0 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full mt-3 group-hover:w-12 transition-all duration-300"></div>

              {/* Arrow indicator */}
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