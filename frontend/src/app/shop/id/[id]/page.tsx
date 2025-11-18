'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import type { Product } from '../../../../lib/types';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId || Number.isNaN(productId)) {
      setError('ID sản phẩm không hợp lệ');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Product>;
      })
      .then((data) => {
        setProduct(data);
      })
      .catch((err: unknown) => {
        setError('Không tải được sản phẩm');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const increase = () => setQuantity((q) => Math.min((product?.stockQuantity ?? 9999), q + 1));
  const decrease = () => setQuantity((q) => Math.max(1, q - 1));

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white">
      <Header />

      <main className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-24">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-24">
            <h2 className="text-2xl font-semibold mb-4">Lỗi</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/shop/products" className="text-[#0f172a] hover:underline">
              ← Quay lại cửa hàng
            </Link>
          </div>
        ) : !product ? (
          <div className="text-center py-24">
            <h2 className="text-2xl font-semibold mb-4">Không tìm thấy sản phẩm</h2>
            <Link href="/shop/products" className="text-[#0f172a] hover:underline">
              ← Quay lại cửa hàng
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <div className="w-full h-[420px] relative bg-gray-100">
                  <Image
                    src={product.image ?? (product.images && product.images[0]) ?? '/hero-handmade.jpg'}
                    alt={product.productName ?? product.name ?? 'Product'}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {product.images && product.images.length > 1 && (
                <div className="mt-4 flex gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={img + idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border ${
                        idx === selectedImageIndex ? 'border-[#0f172a]' : 'border-gray-200'
                      }`}
                    >
                      <Image src={img} alt={`img-${idx}`} width={80} height={80} className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">{product.productName ?? product.name}</h1>
              <div className="text-xl font-extrabold text-[#0f172a]">
                ₫{(Number(product.price) || 0).toLocaleString('vi-VN')}
              </div>

              <div className="text-sm text-gray-600">{product.description ?? product.fullDescription}</div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center border rounded-full overflow-hidden">
                  <button onClick={decrease} className="px-4 py-2 bg-gray-100">-</button>
                  <div className="px-6 py-2">{quantity}</div>
                  <button onClick={increase} className="px-4 py-2 bg-gray-100">+</button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="border-2 border-orange-500 bg-white text-orange-600 px-6 py-3 rounded-full font-semibold shadow-sm hover:bg-orange-50 transition-all duration-300"
                    onClick={() => alert('Thêm vào giỏ (mock)')}
                  >
                    Thêm vào giỏ
                  </button>
                  <button
                    className="bg-[#0f172a] text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-gray-800 transition-all duration-300"
                    onClick={() => alert('Mua ngay (mock)')}
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => alert('Đặt làm riêng (mock)')}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-yellow-500 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Đặt làm riêng</span>
                </button>
              </div>

              <div className="text-sm text-gray-500">
                Kho: {product.stockQuantity ?? product.stock ?? '—'} · Đã bán: {product.quantitySold ?? '—'}
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Danh mục</h3>
                <Link
                  href={`/shop/products?categoryId=${product.categoryId}`}
                  className="text-sm text-[#0f172a] hover:underline"
                >
                  {product.categoryName ?? product.category ?? 'Không xác định'}
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
