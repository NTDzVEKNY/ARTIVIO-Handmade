'use client';

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import Link from "next/link";

interface Category {
  categoryId: number;
  categoryName: string;
}

// helper: chọn icon dựa theo mapping đơn giản (dùng exact name)
const categoryIcons: Record<string, string> = {
  "Đồng hồ": "🕰️",
  "Hoa vĩnh cửu": "🌹",
  "Quà tặng": "🎁",
  "Thiệp handmade": "💌",
  "Phụ kiện & nguyên liệu": "🧵",
  "Vải decor": "🎨",
  "Ví & passport": "💼",
  "Limited": "🌟",
};

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown khi click outside
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(err => console.error("Failed to fetch categories for header:", err));

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white sticky top-0 z-40 border-b shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 relative group-hover:scale-110 transition-transform duration-300">
            <Image
              src="/artivio-logo.png"
              alt="Artivio logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {/* Home */}
          <Link href="/" className="group relative">
            <span className="text-sm font-medium inline-block transition-colors text-gray-800">Trang chủ</span>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
          </Link>

          {/* Dropdown Danh mục */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="group relative flex items-center gap-2 text-sm font-medium"
            >
              <span className="inline-block">Danh mục</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>

              <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </button>

            <div className={`absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 origin-top ${isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'}`}>
              {categories.map((cat, idx) => (
                <Link
                  key={cat.categoryId}
                  href={`/shop/products?categoryId=${cat.categoryId}`}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-sm text-gray-700 transition-all duration-200 relative group overflow-hidden ${idx === 0 ? 'rounded-t-lg' : ''} ${idx === categories.length - 1 ? 'rounded-b-lg' : ''}`}
                >
                  <span className="relative z-10 group-hover:text-black transition-colors flex items-center gap-3">
                    <span className="text-lg">{categoryIcons[cat.categoryName] ?? '🎁'}</span>
                    <span>{cat.categoryName}</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-orange-100 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 -z-0"></div>
                </Link>
              ))}
            </div>
          </div>

          {/* Other links */}
          <Link href="/shop/products" className="group relative">
            <span className="text-sm font-medium inline-block transition-colors text-gray-800">Sản phẩm</span>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link href="#" className="group relative">
            <span className="text-sm font-medium inline-block transition-colors text-gray-800">Làm riêng</span>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link href="#" className="group relative">
            <span className="text-sm font-medium inline-block transition-colors text-gray-800">Đơn hàng</span>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link href="#" className="group relative">
            <span className="text-sm font-medium inline-block transition-colors text-gray-800">Liên hệ</span>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        <div className="flex items-center gap-6">
          <Link href="#" className="flex items-center gap-2 text-gray-600 hover:text-black transition-all duration-300 group">
            <span className="relative transform group-hover:scale-125 transition-transform duration-300">
              🛒
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold group-hover:bg-red-600 transition-colors duration-300">0</span>
            </span>
            <span className="text-sm">Giỏ hàng</span>
          </Link>
          <Link href="#" className="flex items-center gap-2 text-gray-600 hover:text-black transition-all duration-300 group">
            <span className="transform group-hover:scale-125 transition-transform duration-300">🚪</span>
            <span className="text-sm">Đăng Nhập</span>
          </Link>
        </div>
      </div>
    </header>
  );
}