'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { Header, Footer } from "../../../components/common";
import { ShoppingCart, CreditCard } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';

const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả', min: 0, max: Infinity },
  { id: 'under-100k', label: 'Dưới 100.000đ', min: 0, max: 100000 },
  { id: '100k-200k', label: '100.000 - 200.000đ', min: 100000, max: 200000 },
  { id: '200k-500k', label: '200.000 - 500.000đ', min: 200000, max: 500000 },
  { id: 'over-500k', label: 'Trên 500.000đ', min: 500000, max: Infinity },
];

const categoryIcons: Record<string, string> = {
  "Tất cả": "✨",
  "Đồng hồ": "🕰️",
  "Hoa vĩnh cửu": "🌹",
  "Quà tặng": "🎁",
  "Thiệp handmade": "💌",
  "Phụ kiện & nguyên liệu": "🧵",
  "Vải decor": "🧣",
  "Ví & passport": "💼",
  "Limited": "🌟",
};

const SORT_OPTIONS = [
  { id: 'featured', label: 'Nổi bật' },
  { id: 'price-asc', label: 'Giá tăng dần' },
  { id: 'price-desc', label: 'Giá giảm dần' },
];

import { Product, Category } from '@/types';
import { initializeProductsStorage, isProductOutOfStock, getStockStatusText } from '@/lib/inventory';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryIdParam = searchParams.get('categoryId');
  const pageParam = searchParams.get('page');
  const priceRangeParam = searchParams.get('priceRange') || 'all';
  const sortParam = searchParams.get('sort') || 'featured';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<string>(priceRangeParam);
  const [sortBy, setSortBy] = useState<string>(sortParam);
  const [page, setPage] = useState<number>(0);
  const pageSize = 24;
  const { addItem } = useCart();

  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategoryId === 'all' || product.category_id === selectedCategoryId;
      const matchesSearch = searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const priceRange_ = PRICE_RANGES.find(r => r.id === priceRange);
      const price = product.price || 0;
      const matchesPrice = priceRange_ ? (price >= priceRange_.min && price <= priceRange_.max) : true;

      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'featured') {
        const aSold = a.quantity_sold || 0;
        const bSold = b.quantity_sold || 0;
        return bSold - aSold;
      } else if (sortBy === 'price-asc') {
        const aPrice = a.price || 0;
        const bPrice = b.price || 0;
        return aPrice - bPrice;
      } else if (sortBy === 'price-desc') {
        const aPrice = a.price || 0;
        const bPrice = b.price || 0;
        return bPrice - aPrice;
      }
      return 0;
    });

  useEffect(() => {
    const p = Number(pageParam ?? 1);
    setPage(Number.isNaN(p) ? 0 : Math.max(0, p - 1));
  }, [pageParam]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products?size=0'),
          fetch('/api/categories')
        ]);
        const productsData: Product[] | { content: Product[] } = await productsRes.json();
        const categoriesData: Category[] = await categoriesRes.json();

        const productList = 'content' in productsData && Array.isArray(productsData.content) ? productsData.content : productsData;
        const validProducts = Array.isArray(productList) ? productList : [];
        setProducts(validProducts);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        
        // Initialize localStorage with products from server
        if (validProducts.length > 0) {
          initializeProductsStorage(validProducts);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;

    const currentId = categoryIdParam ? parseInt(categoryIdParam, 10) : 'all';

    if (currentId !== 'all' && !Number.isNaN(currentId)) {
      const categoryExists = categories.some(c => c.id === currentId);
      setSelectedCategoryId(categoryExists ? currentId : 'all');
    } else {
      setSelectedCategoryId('all');
    }
    setPage(0);
    const target = currentId === 'all' ? '/shop/products' : `/shop/products?categoryId=${currentId}&page=1`;
    router.replace(target, { scroll: false });
  }, [categoryIdParam, categories, router]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const start = safePage * pageSize;
  const end = start + pageSize;
  const pageItems = filteredProducts.slice(start, end);

  const updateUrlParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams();
    if (selectedCategoryId !== 'all') params.set('categoryId', String(selectedCategoryId));
    params.set('page', String(safePage + 1));
    params.set('priceRange', priceRange);
    params.set('sort', sortBy);
    
    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value);
    });

    const queryString = params.toString();
    router.push(`/shop/products?${queryString}`, { scroll: false });
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock_quantity !== undefined && product.stock_quantity <= 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    addItem({
      id: product.id,
      productName: product.name,
      price: String(product.price ?? 0),
      image: product.image || '/artivio-logo.png',
      stockQuantity: product.stock_quantity,
      quantity: 1,
    });

    toast.success('Đã thêm vào giỏ hàng!');
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    handleAddToCart(e, product);
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="text-lg font-medium animate-pulse" style={{ color: '#D96C39' }}>
          ✨ Đang tải sản phẩm...
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-6 py-12" style={{ background: 'linear-gradient(to bottom, #F7F1E8, #F7F1E8)' }}>
      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-3" style={{ color: '#3F2E23' }}>
          🛍️ Cửa hàng ARTIVIO
        </h1>
        <div className="h-1 w-24 mx-auto rounded-full mb-4" style={{ backgroundColor: '#D96C39' }}></div>
        <p className="text-lg" style={{ color: '#6B4F3E' }}>Khám phá bộ sưu tập sản phẩm thủ công độc đáo của chúng tôi</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex justify-center">
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="w-full px-6 py-4 pl-12 pr-4 text-sm border rounded-full focus:outline-none focus:ring-2 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-300"
            style={{
              backgroundColor: '#F7F1E8',
              borderColor: '#D96C39',
              color: '#3F2E23'
            }}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = '#FFF8F0';
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = '#F7F1E8';
            }}
          />
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#D96C39' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-10">
        <div className="flex flex-wrap gap-3 justify-center">
          {[{ id: 'all', name: 'Tất cả' }, ...categories].map((category) => (
            <button
              key={category.id}
              onClick={() => {
                if (category.id === 'all') {
                  router.push('/shop/products', { scroll: false });
                } else {
                  router.push(`/shop/products?categoryId=${category.id}&page=1`, { scroll: false });
                }
                setSelectedCategoryId(category.id as number | 'all');
                setPage(0);
              }}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-sm border`}
              style={{
                backgroundColor: selectedCategoryId === category.id ? '#D96C39' : '#F7F1E8',
                color: selectedCategoryId === category.id ? 'white' : '#3F2E23',
                borderColor: selectedCategoryId === category.id ? '#D96C39' : '#D96C39'
              }}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">{categoryIcons[String(category.name)] ?? '🎁'}</span>
                <span>{category.name}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Sort Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Price Range Filter */}
        <div className="md:col-span-1">
          <div className="rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300" style={{ backgroundColor: '#F7F1E8', borderColor: '#D96C39', border: '1px solid #D96C39' }}>
            <h3 className="font-semibold mb-5 flex items-center gap-3 text-base" style={{ color: '#3F2E23' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#D96C39' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Mức Giá</span>
            </h3>
            <div className="space-y-3">
              {PRICE_RANGES.map((range) => (
                <label key={range.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all duration-200" style={{ color: '#3F2E23' }}>
                  <input
                    type="radio"
                    name="priceRange"
                    value={range.id}
                    checked={priceRange === range.id}
                    onChange={(e) => {
                      setPriceRange(e.target.value);
                      setPage(0);
                      updateUrlParams({ priceRange: e.target.value, page: '1' });
                    }}
                    className="w-4 h-4"
                  />
                  <span className={`text-sm ${priceRange === range.id ? 'font-semibold' : ''}`} style={{ color: priceRange === range.id ? '#D96C39' : '#3F2E23' }}>
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid + Sort */}
        <div className="md:col-span-3">
          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-8 p-5 rounded-xl shadow-sm" style={{ backgroundColor: '#F7F1E8', borderColor: '#D96C39', border: '1px solid #D96C39' }}>
            <div className="text-sm font-medium" style={{ color: '#3F2E23' }}>
              Tìm thấy <span style={{ color: '#D96C39', fontWeight: 'bold' }}>{filteredProducts.length}</span> sản phẩm
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: '#3F2E23' }}>Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(0);
                  updateUrlParams({ sort: e.target.value, page: '1' });
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 cursor-pointer"
                style={{
                  borderColor: '#D96C39',
                  border: '1px solid #D96C39',
                  backgroundColor: '#FFF8F0',
                  color: '#3F2E23'
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {pageItems.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {pageItems.map((product, idx) => {
                  const categoryName = categories.find(c => c.id === product.category_id)?.name || 'Chưa phân loại';
                  return (
                    <div
                      key={`${product.id}-${idx}`}
                      className="group relative h-full"
                    >
                      <div className="rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col relative" style={{
                        backgroundColor: '#F7F1E8',
                        borderColor: '#D96C39',
                        border: '1px solid #E8D5B5',
                        animation: `fadeInUp 0.5s ease-out ${idx * 0.05}s backwards`
                      }}>
                        {/* Link bao phủ toàn bộ thẻ (lớp nền) */}
                        <Link href={`/shop/id/${product.id}`} className="absolute inset-0 z-0" />

                        {/* Image Container */}
                        <div className="relative w-full h-48 overflow-hidden pointer-events-none" style={{ backgroundColor: '#E8D5B5' }}>
                          <Image
                            src={product.image ? (product.image.startsWith('//') ? `https:${product.image}` : product.image) : '/artivio-logo.png'}
                            alt={product.productName}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {/* Out of Stock Badge */}
                          {isProductOutOfStock(product) && (
                            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10">
                              Hết hàng
                            </div>
                          )}
                          {product.quantity_sold && product.quantity_sold > 0 && !isProductOutOfStock(product) && (
                            <div className="absolute top-3 right-3 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md" style={{ backgroundColor: '#D96C39' }}>
                              ⭐ Bán chạy
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col pointer-events-none relative z-10">
                          <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#D96C39' }}>
                            {categoryName}
                          </div>
                          <h3 className="text-sm font-semibold mb-2 line-clamp-2 transition-colors" style={{ color: '#3F2E23' }}>
                            {product.name}
                          </h3>
                          <p className="text-xs mt-1 line-clamp-2 mb-4 flex-grow" style={{ color: '#6B4F3E' }}>
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between pt-4 relative" style={{ borderTop: '1px solid #E8D5B5' }}>
                            <div className="flex flex-col">
                              <div className="text-lg font-semibold" style={{ color: '#D96C39' }}>
                                ₫{product.price.toLocaleString("vi-VN")}
                              </div>
                              {isProductOutOfStock(product) && (
                                <div className="text-xs font-semibold mt-1" style={{ color: '#DC2626' }}>
                                  {getStockStatusText(product)}
                                </div>
                              )}
                            </div>
                          <div className={`absolute right-0 flex items-center gap-1 transition-opacity duration-300 pointer-events-auto ${isProductOutOfStock(product) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {isProductOutOfStock(product) ? (
                              <div className="px-3 py-1.5 rounded-full text-white shadow-md flex items-center gap-1 text-[10px] font-medium cursor-not-allowed" style={{ backgroundColor: '#9CA3AF' }}>
                                <span className="whitespace-nowrap">Hết hàng</span>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  title="Thêm vào giỏ"
                                  onClick={(e) => handleAddToCart(e, product)}
                                  className="px-2 py-1.5 rounded-full text-white hover:scale-105 transition-transform shadow-md cursor-pointer flex items-center gap-1 text-[10px] font-medium"
                                  style={{ backgroundColor: '#D96C39' }}
                                >
                                  <ShoppingCart size={12} />
                                  <span className="whitespace-nowrap">Thêm vào giỏ</span>
                                </button>
                                <button
                                  type="button"
                                  title="Mua ngay"
                                  onClick={(e) => handleBuyNow(e, product)}
                                  className="px-2 py-1.5 rounded-full text-white hover:scale-105 transition-transform shadow-md cursor-pointer flex items-center gap-1 text-[10px] font-medium"
                                  style={{ backgroundColor: '#3F2E23' }}
                                >
                                  <CreditCard size={12} />
                                  <span className="whitespace-nowrap">Mua ngay</span>
                                </button>
                              </>
                            )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex items-center justify-center gap-2 pb-8 w-full">
                <button
                  onClick={() => {
                    const nextPage = Math.max(0, safePage - 1);
                    setPage(nextPage);
                    router.push(`/shop/products?${selectedCategoryId !== 'all' ? `categoryId=${selectedCategoryId}&` : ''}priceRange=${priceRange}&sort=${sortBy}&page=${nextPage + 1}`, { scroll: false });
                  }}
                  disabled={safePage === 0}
                  className="px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-sm"
                  style={{
                    backgroundColor: safePage === 0 ? '#E8D5B5' : '#F7F1E8',
                    color: '#3F2E23',
                    borderColor: '#D96C39',
                    border: '1px solid #D96C39',
                    opacity: safePage === 0 ? 0.5 : 1,
                    cursor: safePage === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const show = totalPages <= 7 || Math.abs(i - safePage) <= 2 || i === 0 || i === totalPages - 1;
                  if (!show) {
                    const leftGap = i === 1 && safePage > 3;
                    const rightGap = i === totalPages - 2 && safePage < totalPages - 4;
                    if (leftGap || rightGap) {
                      return <span key={`gap-${i}`} className="px-2 font-medium" style={{ color: '#D96C39' }}>…</span>;
                    }
                    return null;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setPage(i);
                        router.push(`/shop/products?${selectedCategoryId !== 'all' ? `categoryId=${selectedCategoryId}&` : ''}priceRange=${priceRange}&sort=${sortBy}&page=${i + 1}`, { scroll: false });
                      }}
                      className="px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-110 shadow-sm"
                      style={{
                        backgroundColor: i === safePage ? '#D96C39' : '#F7F1E8',
                        color: i === safePage ? 'white' : '#3F2E23',
                        borderColor: '#D96C39',
                        border: '1px solid #D96C39'
                      }}
                    >
                      {i + 1}
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    const nextPage = Math.min(totalPages - 1, safePage + 1);
                    setPage(nextPage);
                    router.push(`/shop/products?${selectedCategoryId !== 'all' ? `categoryId=${selectedCategoryId}&` : ''}priceRange=${priceRange}&sort=${sortBy}&page=${nextPage + 1}`, { scroll: false });
                  }}
                  disabled={safePage >= totalPages - 1}
                  className="px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-sm"
                  style={{
                    backgroundColor: safePage >= totalPages - 1 ? '#E8D5B5' : '#F7F1E8',
                    color: '#3F2E23',
                    borderColor: '#D96C39',
                    border: '1px solid #D96C39',
                    opacity: safePage >= totalPages - 1 ? 0.5 : 1,
                    cursor: safePage >= totalPages - 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-8xl mb-6 animate-bounce">🔍</div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: '#3F2E23' }}>Không tìm thấy sản phẩm</h3>
              <p className="text-base" style={{ color: '#6B4F3E' }}>
                {searchQuery
                  ? `Không có sản phẩm nào phù hợp với "${searchQuery}". Hãy thử từ khóa khác.`
                  : "Hãy thử chọn danh mục hoặc mức giá khác."}
              </p>
            </div>
          )}
        </div>
      </div>

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
    </main>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#F7F1E8', color: '#3F2E23' }}>
      <Toaster position="top-center" />
      <Header />
      <Suspense fallback={
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-16">
            <div className="text-lg font-medium animate-pulse" style={{ color: '#D96C39' }}>
              ✨ Đang tải...
            </div>
          </div>
        </main>
      }>
        <ProductsPageContent />
      </Suspense>
      <Footer />
    </div>
  );
}
