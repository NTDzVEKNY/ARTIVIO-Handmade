'use client';

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import Link from "next/link";

interface Category {
  categoryId: number;
  categoryName: string;
}

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
    <header className="w-full sticky top-0 z-40 shadow-sm" style={{ backgroundColor: '#6B4F3E' }}>
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
          <Link href="/" className="group relative">
            <span className="text-sm font-medium inline-block transition-colors" style={{ color: '#F7F1E8' }}>
              Trang chủ
            </span>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-full" style={{ backgroundColor: '#F4C27A' }}></span>
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="group relative flex items-center gap-2 text-sm font-medium"
              style={{ color: '#F7F1E8' }}
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

              <span className="absolute left-0 -bottom-1 h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-full" style={{ backgroundColor: '#F4C27A' }}></span>
            </button>

            <div className={`absolute top-full left-0 mt-2 w-56 rounded-lg shadow-lg transition-all duration-300 origin-top ${isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'}`} style={{ backgroundColor: '#F7F1E8', borderColor: '#D96C39', border: '1px solid #D96C39' }}>
              {categories.map((cat, idx) => (
                <Link
                  key={cat.categoryId}
                  href={`/shop/products?categoryId=${cat.categoryId}`}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-sm transition-all duration-200 relative group overflow-hidden ${idx === 0 ? 'rounded-t-lg' : ''} ${idx === categories.length - 1 ? 'rounded-b-lg' : ''}`}
                  style={{ color: '#3F2E23' }}
                >
                  <span className="relative z-10 group-hover:font-semibold transition-all flex items-center gap-3">
                    <span className="text-lg">{categoryIcons[cat.categoryName] ?? '🎁'}</span>
                    <span>{cat.categoryName}</span>
                  </span>
                  <div className="absolute inset-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 -z-0" style={{ backgroundColor: '#F4C27A', opacity: 0.2 }}></div>
                </Link>
              ))}
            </div>
          </div>

          <Link href="/shop/products" className="group relative">
            <span className="text-sm font-medium inline-block transition-colors" style={{ color: '#F7F1E8' }}>
              Sản phẩm
            </span>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-full" style={{ backgroundColor: '#F4C27A' }}></span>
          </Link>

          <Link href="#" className="group relative">
            <span className="text-sm font-medium inline-block transition-colors" style={{ color: '#F7F1E8' }}>
              Làm riêng
            </span>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-full" style={{ backgroundColor: '#F4C27A' }}></span>
          </Link>

          <Link href="#" className="group relative">
            <span className="text-sm font-medium inline-block transition-colors" style={{ color: '#F7F1E8' }}>
              Đơn hàng
            </span>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-full" style={{ backgroundColor: '#F4C27A' }}></span>
          </Link>

          <Link href="#" className="group relative">
            <span className="text-sm font-medium inline-block transition-colors" style={{ color: '#F7F1E8' }}>
              Liên hệ
            </span>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-full" style={{ backgroundColor: '#F4C27A' }}></span>
          </Link>
        </nav>

        <div className="flex items-center gap-6">
          <Link href="#" className="flex items-center gap-2 transition-all duration-300 group" style={{ color: '#F7F1E8' }}>
            <span className="relative transform group-hover:scale-125 transition-transform duration-300">
              🛒
              <span className="absolute -top-2 -right-2 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold" style={{ backgroundColor: '#D96C39' }}>0</span>
            </span>
            <span className="text-sm">Giỏ hàng</span>
          </Link>
          <Link href="#" className="flex items-center gap-2 transition-all duration-300 group" style={{ color: '#F7F1E8' }}>
            <span className="transform group-hover:scale-125 transition-transform duration-300">🚪</span>
            <span className="text-sm">Đăng Nhập</span>
          </Link>
        </div>
      </div>
    </header>
  );
}