'use client';

import {useState, useEffect} from 'react';
import Image from "next/image";
import Link from "next/link";
import {axiosClient} from '@/lib/axios';
import { mapToProductWithCategory, ProductWithCategory } from '@/utils/ProductMapper';
import { PaginatedProductResponse } from '@/types/apiTypes';


export default function FeaturedProducts() {
    const [products, setProducts] = useState<ProductWithCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosClient.get<PaginatedProductResponse>('/products');
                const productsWithCategory = response.data.content.map(mapToProductWithCategory);
                const productsData = productsWithCategory.slice(0, 8);

                setProducts(productsData);
                setLoading(false);

                console.log(">>> Featured products:", productsData);

            } catch (error) {
                console.error("Failed to fetch featured products:", error);
                setProducts([]);
                setLoading(false);
            }
        }

        fetchProducts().catch(console.error);
    }, []);

    return (
        <section className="mt-16 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2" style={{color: '#3F2E23'}}>Sản phẩm nổi bật</h2>
                    <div className="h-1 w-20 rounded-full" style={{backgroundColor: '#D96C39'}}></div>
                </div>
                <Link href="/shop/products" className="text-sm font-medium transition-colors"
                      style={{color: '#D96C39'}}>Xem tất cả →</Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({length: 8}).map((_, i) => (
                        <div key={i} className="rounded-xl h-64 animate-pulse"
                             style={{backgroundColor: '#E8D5B5'}}></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product, idx) => (
                        <Link
                            key={product.id}
                            href={`/shop/id/${product.id}`}
                            className="group relative"
                        >
                            <div
                                className="rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col"
                                style={{
                                    backgroundColor: '#F7F1E8',
                                    borderColor: '#E8D5B5',
                                    border: '1px solid #E8D5B5',
                                    animation: `fadeInUp 0.5s ease-out ${idx * 0.05}s backwards`
                                }}>
                                <div className="relative w-full h-44 overflow-hidden"
                                     style={{backgroundColor: '#E8D5B5'}}>
                                    <Image
                                        src={product.image ? (product.image.startsWith('//') ? `https:${product.image}` : product.image) : product.image || 'https://placehold.co/600x400?text=No+Image'}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {product.quantity_sold && product.quantity_sold > 0 && (
                                        <div
                                            className="absolute top-3 right-3 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md"
                                            style={{backgroundColor: '#D96C39'}}>
                                            ⭐ Bán chạy
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-2"
                                         style={{color: '#D96C39'}}>
                                        {product.categoryName ?? ''}
                                    </div>
                                    <h3 className="text-sm font-semibold mb-2 line-clamp-2 group-hover:font-bold transition-all"
                                        style={{color: '#3F2E23'}}>
                                        {product.name}
                                    </h3>
                                    <p className="text-xs mt-1 line-clamp-2 mb-4 flex-grow" style={{color: '#6B4F3E'}}>
                                        {product.description}
                                    </p>
                                    <div className="flex items-center justify-between pt-4"
                                         style={{borderTop: '1px solid #E8D5B5'}}>
                                        <div className="text-lg font-bold" style={{color: '#D96C39'}}>
                                            ₫{product.price.toLocaleString("vi-VN")}
                                        </div>
                                        <div
                                            className="text-xs text-white px-3 py-2 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110"
                                            style={{backgroundColor: '#D96C39'}}>
                                            Xem →
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </section>
    );
}