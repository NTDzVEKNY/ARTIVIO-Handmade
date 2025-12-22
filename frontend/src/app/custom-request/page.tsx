'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { getProducts } from '@/services/api';
import type { Product } from '@/types';

export default function CustomRequestPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts({ page: 1, size: 12 });
        setProducts(response.content || []);
      } catch (error) {
        toast.error('Không tải được danh sách sản phẩm');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white">
      <Header />

      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Yêu cầu sản phẩm tùy chỉnh</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bạn muốn một sản phẩm handmade độc đáo theo ý tưởng của riêng mình? Hãy chọn một sản phẩm tham khảo và gửi yêu cầu tùy chỉnh cho chúng tôi!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-600 mb-6">Chưa có sản phẩm nào</p>
            <Link
              href="/shop/products"
              className="inline-block bg-[#0f172a] text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-gray-600 text-center">
                Chọn một sản phẩm để bắt đầu yêu cầu tùy chỉnh của bạn
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/custom-request/${product.id}`}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative w-full h-48 bg-gray-100">
                    <Image
                      src={product.image || '/hero-handmade.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0f172a] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-[#0f172a] mb-3">
                      ₫{(product.price || 0).toLocaleString('vi-VN')}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Kho: {product.stock_quantity ?? '—'}
                      </span>
                      <span className="text-sm font-medium text-[#0f172a] group-hover:underline">
                        Yêu cầu tùy chỉnh →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/shop/products"
                className="inline-block bg-gray-100 text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all"
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

