'use client';

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  "Đồng hồ",
  "Hoa vĩnh cửu",
  "Quà tặng",
  "Thiệp handmade",
  "Phụ kiện & nguyên liệu",
  "Vải decor",
  "Ví & passport",
  "Limited",
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown khi click outside
  useEffect(() => {
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
          <Link href="/" className="text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full transition-colors pb-0.5">Trang chủ</Link>
          
          {/* Dropdown Danh mục */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-sm font-medium hover:text-black flex items-center gap-2 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full pb-0.5"
            >
              Danh mục
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
            
            <div className={`absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 origin-top ${
              isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'
            }`}>
              {CATEGORIES.map((cat, idx) => (
                <Link
                  key={cat}
                  href={`/shop/products?category=${encodeURIComponent(cat)}`}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-sm text-gray-700 transition-all duration-200 relative group overflow-hidden ${
                    idx === 0 ? 'rounded-t-lg' : ''
                  } ${
                    idx === CATEGORIES.length - 1 ? 'rounded-b-lg' : ''
                  }`}
                >
                  <span className="relative z-10 group-hover:text-black transition-colors">
                    {cat}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-orange-100 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 -z-0"></div>
                </Link>
              ))}
            </div>
          </div>

          <Link href="/shop/products" className="text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full pb-0.5 transition-colors">Sản phẩm</Link>
          <Link href="#" className="text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full pb-0.5 transition-colors">Làm riêng</Link>
          <Link href="#" className="text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full pb-0.5 transition-colors">Đơn hàng</Link>
          <Link href="#" className="text-sm font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full pb-0.5 transition-colors">Liên hệ</Link>
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