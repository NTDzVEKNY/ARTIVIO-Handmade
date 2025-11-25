'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { Header, Footer } from "../../../components/common";

const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả', min: 0, max: Infinity },
  { id: 'under-100k', label: 'Dưới 100.000đ', min: 0, max: 100000 },
  { id: '100k-200k', label: '100.000 - 200.000đ', min: 100000, max: 200000 },
  { id: '200k-500k', label: '200.000 - 500.000đ', min: 200000, max: 500000 },
  { id: 'over-500k', label: 'Trên 500.000đ', min: 500000, max: Infinity },
];

// thay getCategoryIcon bằng mapping đơn giản (trùng với Categories.tsx)
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

const SORT_OPTIONS = [
  { id: 'featured', label: 'Nổi bật' },
  { id: 'price-asc', label: 'Giá tăng dần' },
  { id: 'price-desc', label: 'Giá giảm dần' },
];

interface Product {
  id: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  price: string;
  description: string;
  image: string;
  quantitySold?: number;
}

interface Category {
  categoryId: number;
  categoryName: string;
}

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

  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategoryId === 'all' || product.categoryId === selectedCategoryId;
      const matchesSearch = searchQuery === '' ||
        product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const priceRange_ = PRICE_RANGES.find(r => r.id === priceRange);
      const price = Number(product.price) || 0;
      const matchesPrice = priceRange_ ? (price >= priceRange_.min && price <= priceRange_.max) : true;

      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'featured') {
        const aSold = a.quantitySold || 0;
        const bSold = b.quantitySold || 0;
        return bSold - aSold;
      } else if (sortBy === 'price-asc') {
        const aPrice = Number(a.price) || 0;
        const bPrice = Number(b.price) || 0;
        return aPrice - bPrice;
      } else if (sortBy === 'price-desc') {
        const aPrice = Number(a.price) || 0;
        const bPrice = Number(b.price) || 0;
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
        setProducts(Array.isArray(productList) ? productList : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
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
      const categoryExists = categories.some(c => c.categoryId === currentId);
      setSelectedCategoryId(categoryExists ? currentId : 'all');
    } else {
      setSelectedCategoryId('all');
    }
    setPage(0);
    const target = currentId === 'all' ? '/shop/products' : `/shop/products?categoryId=${currentId}&page=1`;
    router.replace(target);
  }, [categoryIdParam, categories]);

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
    router.push(`/shop/products?${queryString}`);
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="text-lg bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-semibold animate-pulse">
          ✨ Đang tải sản phẩm...
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-6 py-12 bg-gradient-to-b from-white via-yellow-50 to-white">
      {/* Page Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-500 bg-clip-text text-transparent mb-3 animate-fade-in">
          🛍️ Cửa hàng ARTIVIO
        </h1>
        <div className="h-1 w-24 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4"></div>
        <p className="text-gray-600 text-lg">Khám phá bộ sưu tập sản phẩm thủ công độc đáo của chúng tôi</p>
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
            className="w-full px-6 py-4 pl-12 pr-4 text-sm border-2 border-yellow-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-md hover:shadow-lg transition-all duration-300 bg-white"
          />
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-10">
        <div className="flex flex-wrap gap-3 justify-center">
          {[{ categoryId: 'all', categoryName: 'Tất cả' }, ...categories].map((category) => (
            <button
              key={category.categoryId}
              onClick={() => {
                if (category.categoryId === 'all') {
                  router.push('/shop/products');
                } else {
                  router.push(`/shop/products?categoryId=${category.categoryId}&page=1`);
                }
                setSelectedCategoryId(category.categoryId as number | 'all');
                setPage(0);
              }}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-md ${
                selectedCategoryId === category.categoryId
                  ? "bg-gradient-to-r from-orange-600 to-yellow-500 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 border-2 border-yellow-200 hover:border-orange-400"
              }`}
            >
                <span className="flex items-center gap-3">
                  <span className="text-lg">{categoryIcons[String(category.categoryName)] ?? '🎁'}</span>
                  <span>{category.categoryName}</span>
                </span>
                </button>
              ))}
        </div>
      </div>

      {/* Filter & Sort Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Price Range Filter */}
        <div className="md:col-span-1">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3 text-lg">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">Mức Giá</span>
            </h3>
            <div className="space-y-3">
              {PRICE_RANGES.map((range) => (
                <label key={range.id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-3 rounded-lg transition-all duration-200 transform hover:scale-105">
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
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className={`text-sm font-medium ${priceRange === range.id ? 'text-orange-600 font-bold' : 'text-gray-700'}`}>
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
          <div className="flex items-center justify-between mb-8 p-5 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-yellow-300 shadow-md">
            <div className="text-sm font-semibold text-gray-800">
              Tìm thấy <span className="text-orange-600 text-lg">{filteredProducts.length}</span> sản phẩm
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(0);
                  updateUrlParams({ sort: e.target.value, page: '1' });
                }}
                className="px-4 py-2 text-sm font-medium border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-700 hover:border-orange-500 transition-all duration-300 cursor-pointer"
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
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageItems.map((product, idx) => (
                  <Link
                    key={product.id}
                    href={`/shop/id/${product.id}`}
                    className="group relative"
                  >
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-yellow-100 hover:border-orange-400 h-full flex flex-col"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${idx * 0.05}s backwards`
                      }}
                    >
                      {/* Image Container */}
                      <div className="relative w-full h-48 bg-gradient-to-br from-yellow-100 to-orange-100 overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.productName}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {product.quantitySold && product.quantitySold > 0 && (
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            ⭐ Bán chạy
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">
                          {product.categoryName}
                        </div>
                        <h3 className="text-sm font-bold mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors text-gray-900">
                          {product.productName}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2 mb-4 flex-grow">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t-2 border-yellow-100">
                          <div className="text-lg font-bold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
                            ₫{Number(product.price).toLocaleString("vi-VN")}
                          </div>
                          <div className="text-xs bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-2 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
                            Xem →
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex items-center justify-center gap-2 pb-8">
                <button
                  onClick={() => {
                    const nextPage = Math.max(0, safePage - 1);
                    setPage(nextPage);
                    router.push(`/shop/products?${selectedCategoryId !== 'all' ? `categoryId=${selectedCategoryId}&` : ''}priceRange=${priceRange}&sort=${sortBy}&page=${nextPage + 1}`);
                  }}
                  disabled={safePage === 0}
                  className="px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-300 to-orange-300 hover:from-yellow-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-800 font-bold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const show = totalPages <= 7 || Math.abs(i - safePage) <= 2 || i === 0 || i === totalPages - 1;
                  if (!show) {
                    const leftGap = i === 1 && safePage > 3;
                    const rightGap = i === totalPages - 2 && safePage < totalPages - 4;
                    if (leftGap || rightGap) {
                      return <span key={`gap-${i}`} className="px-2 text-gray-400 font-bold">…</span>;
                    }
                    return null;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setPage(i);
                        router.push(`/shop/products?${selectedCategoryId !== 'all' ? `categoryId=${selectedCategoryId}&` : ''}priceRange=${priceRange}&sort=${sortBy}&page=${i + 1}`);
                      }}
                      className={`px-4 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-110 shadow-md ${
                        i === safePage
                          ? 'bg-gradient-to-r from-orange-600 to-yellow-500 text-white shadow-lg scale-110'
                          : 'bg-white text-gray-700 border-2 border-yellow-300 hover:border-orange-400 hover:bg-yellow-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    const nextPage = Math.min(totalPages - 1, safePage + 1);
                    setPage(nextPage);
                    router.push(`/shop/products?${selectedCategoryId !== 'all' ? `categoryId=${selectedCategoryId}&` : ''}priceRange=${priceRange}&sort=${sortBy}&page=${nextPage + 1}`);
                  }}
                  disabled={safePage >= totalPages - 1}
                  className="px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-300 to-orange-300 hover:from-yellow-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-800 font-bold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Next →
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-8xl mb-6 animate-bounce">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-600 text-lg">
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

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen font-sans text-gray-800 bg-white">
      <Header />
      <Suspense fallback={
        <main className="container mx-auto px-6 py-8">
          <div className="text-center py-16">
            <div className="text-lg bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-bold animate-pulse">
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
