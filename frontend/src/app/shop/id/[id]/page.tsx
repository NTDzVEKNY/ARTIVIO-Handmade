'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import type { Product as ProductImported } from '@/types';

type Product = {
  id?: number;
  productName?: string;
  name?: string;
  price?: number | string;
  image?: string | string[];
  images?: string[];
  description?: string;
  stockQuantity?: number;
  quantitySold?: number;
  categoryId?: number | string;
  categoryName?: string;
};

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((i) => typeof i === 'string');
}

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
        return res.json() as Promise<ProductImported | unknown>;
      })
      .then((data) => {
        // treat response as unknown and read fields with runtime guards (no `any`)
        const raw = data as unknown as Record<string, unknown>;

        const mapped: Product = {
          id: typeof raw.id === 'number' ? (raw.id as number) : undefined,
          productName:
            typeof raw.productName === 'string' ? (raw.productName as string) : typeof raw.name === 'string' ? (raw.name as string) : undefined,
          price: typeof raw.price === 'number' || typeof raw.price === 'string' ? (raw.price as number | string) : undefined,
          images: isStringArray(raw.images) ? (raw.images as string[]) : undefined,
          image:
            typeof raw.image === 'string'
              ? (raw.image as string)
              : isStringArray(raw.image)
              ? (raw.image as string[])
              : undefined,
          description: typeof raw.description === 'string' ? (raw.description as string) : undefined,
          stockQuantity: typeof raw.stockQuantity === 'number' ? (raw.stockQuantity as number) : typeof raw.stock === 'number' ? (raw.stock as number) : undefined,
          quantitySold: typeof raw.quantitySold === 'number' ? (raw.quantitySold as number) : undefined,
          categoryId: typeof raw.categoryId === 'string' || typeof raw.categoryId === 'number' ? (raw.categoryId as number | string) : undefined,
          categoryName: typeof raw.categoryName === 'string' ? (raw.categoryName as string) : undefined,
        };

        setProduct(mapped);
        setQuantity(1);
      })
      .catch((err: unknown) => {
        setError('Không tải được sản phẩm');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const increase = () =>
    setQuantity((q) => {
      const max = product?.stockQuantity ?? 9999;
      return Math.min(max, q + 1);
    });
  const decrease = () => setQuantity((q) => Math.max(1, q - 1));

  const onQuantityChange = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      setQuantity(1);
      return;
    }
    const min = 1;
    const max = product?.stockQuantity ?? 9999;
    const clamped = Math.max(min, Math.min(max, Math.floor(parsed)));
    setQuantity(clamped);
  };

  const images: string[] = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length) return product.images;
    if (Array.isArray(product.image) && product.image.length) return product.image as string[];
    if (typeof product.image === 'string' && product.image) return [product.image];
    return [];
  }, [product]);

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
                    src={images[selectedImageIndex] ?? images[0] ?? (typeof product.image === 'string' ? product.image : '/hero-handmade.jpg')}
                    alt={product.productName ?? product.name ?? 'Product'}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {images.length > 1 && (
                <div className="mt-4 flex gap-3">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={`${img}-${idx}`}
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

              <div className="text-sm text-gray-600">{product.description}</div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center border rounded-full overflow-hidden">
                  <button
                    onClick={decrease}
                    aria-label="Giảm số lượng"
                    className="px-4 py-2 bg-gray-100 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>

                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={product.stockQuantity ?? 9999}
                    value={quantity}
                    onChange={(e) => onQuantityChange(e.target.value)}
                    className="w-20 text-center px-3 py-2 outline-none appearance-none bg-white"
                    aria-label="Số lượng"
                  />

                  <button
                    onClick={increase}
                    aria-label="Tăng số lượng"
                    className="px-4 py-2 bg-gray-100 disabled:opacity-50"
                    disabled={quantity >= (product.stockQuantity ?? 9999)}
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="border-2 border-orange-500 bg-white text-orange-600 px-6 py-3 rounded-full font-semibold shadow-sm hover:bg-orange-50 transition-all duration-300"
                    onClick={() => alert(`Thêm ${quantity} vào giỏ (mock)`)}
                  >
                    Thêm vào giỏ
                  </button>
                  <button
                    className="bg-[#0f172a] text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-gray-800 transition-all duration-300"
                    onClick={() => alert(`Mua ${quantity} (mock)`)}
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
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
                Kho: {product.stockQuantity ?? '—'} · Đã bán: {product.quantitySold ?? '—'}
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Danh mục</h3>
                <Link href={`/shop/products?categoryId=${product.categoryId ?? ''}`} className="text-sm text-[#0f172a] hover:underline">
                  {product.categoryName ?? 'Không xác định'}
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