'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { useCart } from '@/contexts/CartContext';
import type { Product, Category } from '@/types';
import { isProductOutOfStock, getStockStatusText } from '@/lib/inventory';
import { axiosClient } from "@/lib/axios"; // Import axiosClient

export default function ProductDetailPage() {
    const params = useParams();
    const productId = Number(params.id);
    const { addItem } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [categoryName, setCategoryName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [addToCartSuccess, setAddToCartSuccess] = useState(false);

    useEffect(() => {
        // Validate ID
        if (!productId || Number.isNaN(productId)) {
            setError('ID sản phẩm không hợp lệ');
            setLoading(false);
            return;
        }

        const fetchProductData = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Gọi API lấy chi tiết sản phẩm
                // Lưu ý: Endpoint thường là /products/{id}, axiosClient đã cấu hình baseURL
                const { data: productData } = await axiosClient.get<Product>(`/products/${productId}`);

                setProduct(productData);
                setQuantity(1); // Reset số lượng khi load sản phẩm mới

                // 2. Gọi API lấy danh mục (nếu có category_id)
                // Logic cũ của bạn là lấy tất cả rồi find, tôi giữ nguyên logic này nhưng dùng axios
                if (productData.category_id) {
                    try {
                        // Giả định endpoint danh mục là /category (dựa trên code trước đó)
                        // Nếu backend hỗ trợ get category theo ID (vd: /category/{id}) thì nên dùng cái đó sẽ nhanh hơn
                        const { data: categories } = await axiosClient.get<Category[]>('/category');
                        const matchedCat = categories.find((c) => c.id === productData.category_id);
                        if (matchedCat) {
                            setCategoryName(matchedCat.name);
                        }
                    } catch (catErr) {
                        console.warn('Failed to fetch category name', catErr);
                        // Không set error chính vì lỗi này không ảnh hưởng luồng chính
                    }
                }
            } catch (err: any) {
                console.error("Error fetching product:", err);
                // Xử lý lỗi từ Axios
                if (err.response && err.response.status === 404) {
                    setError('Không tìm thấy sản phẩm này.');
                } else {
                    setError(err.message || 'Không tải được thông tin sản phẩm');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [productId]);

    const increase = () =>
        setQuantity((q) => {
            const max = product?.stock_quantity ?? 9999;
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
        const max = product?.stock_quantity ?? 9999;
        const clamped = Math.max(min, Math.min(max, Math.floor(parsed)));
        setQuantity(clamped);
    };

    const handleAddToCart = () => {
        if (!product || !product.id) return;

        // Xử lý ảnh an toàn (tránh lỗi nếu ảnh null hoặc format lạ)
        let imageUrl = product.image || '/hero-handmade.jpg';
        if (imageUrl.startsWith('//')) imageUrl = `https:${imageUrl}`;

        addItem({
            id: product.id,
            productName: product.name,
            price: String(product.price ?? 0),
            image: imageUrl,
            stockQuantity: product.stock_quantity,
            quantity: quantity,
        });

        setAddToCartSuccess(true);
        setTimeout(() => setAddToCartSuccess(false), 3000);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        // Router push to checkout handled by Link in JSX usually,
        // or you can add router.push('/checkout') here if not using Link
    };

    return (
        <div className="min-h-screen font-sans text-gray-800 bg-white">
            <Header />

            <main className="container mx-auto px-6 py-12">
                {loading ? (
                    <div className="text-center py-24">
                        <div className="text-lg font-medium animate-pulse text-orange-600">
                            ✨ Đang tải chi tiết...
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center py-24">
                        <h2 className="text-2xl font-semibold mb-4 text-red-600">Lỗi</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Link href="/shop/products" className="text-[#0f172a] hover:underline font-medium">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start animate-fadeIn">
                        {/* Image Section */}
                        <div>
                            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                                <div className="w-full h-[500px] relative bg-gray-50">
                                    <Image
                                        src={product.image ? (product.image.startsWith('//') ? `https:${product.image}` : product.image) : '/hero-handmade.jpg'}
                                        alt={product.name ?? 'Product Image'}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-700"
                                        priority
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    {isProductOutOfStock(product) && (
                                        <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-sm text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg z-10">
                                            Hết hàng
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-8">
                            <div>
                                {categoryName && (
                                    <span className="text-orange-600 font-semibold text-sm tracking-wider uppercase mb-2 block">
                        {categoryName}
                    </span>
                                )}
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                                    <div className="text-2xl font-extrabold text-orange-600">
                                        ₫{(product.price || 0).toLocaleString('vi-VN')}
                                    </div>
                                    {isProductOutOfStock(product) ? (
                                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                        Hết hàng
                     </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        Còn hàng
                     </span>
                                    )}
                                </div>
                            </div>

                            {product.description && (
                                <div className="text-gray-600 leading-relaxed text-base">
                                    {product.description}
                                </div>
                            )}

                            {/* Quantity and Actions */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-700 font-medium">Số lượng:</span>
                                    <div className={`flex items-center border border-gray-300 rounded-full overflow-hidden ${isProductOutOfStock(product) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <button
                                            onClick={decrease}
                                            aria-label="Giảm số lượng"
                                            className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                            disabled={quantity <= 1 || isProductOutOfStock(product)}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            min={1}
                                            max={product.stock_quantity ?? 9999}
                                            value={quantity}
                                            onChange={(e) => onQuantityChange(e.target.value)}
                                            className="w-16 text-center px-2 py-2 outline-none appearance-none bg-white font-medium"
                                            aria-label="Số lượng"
                                            disabled={isProductOutOfStock(product)}
                                        />
                                        <button
                                            onClick={increase}
                                            aria-label="Tăng số lượng"
                                            className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                            disabled={quantity >= (product.stock_quantity ?? 9999) || isProductOutOfStock(product)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-sm text-gray-400">
                        ({product.stock_quantity ?? 0} sản phẩm có sẵn)
                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                    {isProductOutOfStock(product) ? (
                                        <button disabled className="w-full sm:w-auto px-8 py-4 rounded-full font-bold shadow-sm bg-gray-200 text-gray-500 cursor-not-allowed">
                                            Sản phẩm tạm hết hàng
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                className={`w-full sm:w-auto flex-1 border-2 border-orange-500 bg-white text-orange-600 px-8 py-3.5 rounded-full font-bold hover:bg-orange-50 transition-all duration-300 transform hover:-translate-y-1 ${addToCartSuccess ? '!bg-green-50 !border-green-500 !text-green-600' : ''}`}
                                                onClick={handleAddToCart}
                                            >
                                                {addToCartSuccess ? (
                                                    <span className="flex items-center justify-center gap-2">
                              ✓ Đã thêm
                            </span>
                                                ) : (
                                                    'Thêm vào giỏ'
                                                )}
                                            </button>

                                            <Link
                                                href="/cart"
                                                className="w-full sm:w-auto flex-1 bg-orange-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-orange-700 hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-1"
                                                onClick={handleBuyNow}
                                            >
                                                Mua ngay
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Category Link Bottom */}
                            {categoryName && product.category_id && (
                                <div className="pt-6 border-t border-gray-100 mt-6">
                                    <p className="text-sm text-gray-500">
                                        Danh mục: <Link href={`/shop/products?categoryId=${product.category_id}`} className="text-orange-600 hover:underline font-medium ml-1">{categoryName}</Link>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}