"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { axiosClient as apiClient } from '@/lib/axios';
import { Category, Product, ProductResponse } from '@/types';

interface EnrichedCategory extends Category {
  soldCount?: number;
}

const categoryIcons: { [key: string]: string } = {
  "đồng hồ": "🕰️",
  "hoa vĩnh cửu": "🌹",
  "quà tặng": "🎁",
  "thiệp handmade": "💌",
  "phụ kiện & nguyên liệu": "🧵",
  "vải decor": "🧣",
  "ví & passport": "💼",
  "limited": "🌟",
};

export default function Categories() {
  const [categories, setCategories] = useState<EnrichedCategory[]>([]);
  const [loading, setLoading] = useState(true); // 2. Thêm state loading và error
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 3. Dùng apiClient với Promise.all, cú pháp async/await cho sạch sẽ
        const [categoriesResponse, productsResponse] = await Promise.all([
          apiClient.get<Category[] | { content: Category[] }>('/category'),
          // Thêm tham số phân trang để tránh lỗi 400.
          // CẢNH BÁO: Gọi API lấy tất cả sản phẩm ở đây là một vấn đề hiệu năng nghiêm trọng.
          // Bạn nên tạo một API riêng ở backend để thay thế.
          apiClient.get<ProductResponse>('/products', {
            params: { page: 0, size: 2000 } // Lấy tối đa 2000 sản phẩm để tính toán
          }),
        ]);

        // Backend có thể trả về mảng trực tiếp, hoặc đối tượng Pageable { content: [...] }
        const rawCats: Category[] = Array.isArray(categoriesResponse.data) 
          ? categoriesResponse.data 
          : categoriesResponse.data.content || [];
        // Lọc ra các danh mục không hợp lệ (thiếu id hoặc name) để tránh lỗi runtime
        const cats: Category[] = rawCats.filter(cat => cat && typeof cat.categoryId === 'number' && typeof cat.categoryName === 'string');
        const products: Product[] = productsResponse.data.content || [];

        // Logic tính toán và sắp xếp giữ nguyên
        const soldMap = new Map<number, number>();
        for (const p of products) {
          const cid = p.categoryId;
          if (cid !== null) {
            const sold = p.quantitySold || 0;
            soldMap.set(cid, (soldMap.get(cid) ?? 0) + sold);
          }
        }

        const enrichedCategories: EnrichedCategory[] = cats.map((c) => ({
          ...c,
          soldCount: soldMap.get(c.categoryId) ?? 0,
        }));

        enrichedCategories.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
        setCategories(enrichedCategories.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch category data:', err);
        setError('Không thể tải danh mục nổi bật.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 4. Xử lý giao diện cho trạng thái loading và error
  if (loading) {
    // Bạn có thể tạo một component skeleton đẹp hơn ở đây
    return <div className="mt-16 py-8 text-center">Đang tải danh mục...</div>;
  }

  if (error) {
    return <div className="mt-16 py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <section className="mt-16 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: '#3F2E23' }}>Danh mục nổi bật</h2>
        <div className="h-1 w-20 rounded-full" style={{ backgroundColor: '#D96C39' }}></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6">
        {categories.map((category) => {
          const normalizedName = category.categoryName.toLowerCase().trim();
          const icon = categoryIcons[normalizedName] || '🎁';

          return (
            <Link
              key={category.categoryId}
              href={`/shop/products?categoryId=${category.categoryId}`}
              className="group relative block"
            >
              <div className="absolute inset-0 rounded-2xl transform group-hover:scale-105 transition-transform duration-300 -z-10" style={{ backgroundColor: 'rgba(217, 108, 57, 0.08)' }}></div>
              
              <div className="rounded-2xl shadow-sm p-6 flex flex-col items-center text-center transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-2" style={{ backgroundColor: '#F7F1E8' }}>
                <div className="w-24 h-24 rounded-full mb-4 flex items-center justify-center text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" style={{ backgroundColor: '#F4C27A', opacity: 0.6 }}>
                  {icon}
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
          );
        })}
      </div>
    </section>
  );
}