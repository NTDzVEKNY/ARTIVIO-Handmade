'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { Header, Footer } from "../../../components/common";

const CATEGORIES = [
  "Tất cả"
]; // Base category, others will be fetched

// Define types for our data
interface Product {
  id: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  price: string; // API returns price as string
  description: string;
  image: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryIdParam = searchParams.get('categoryId');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategoryId === 'all' || product.categoryId === selectedCategoryId;
    const matchesSearch = searchQuery === '' ||
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

        // API có thể trả về { content: [...] } hoặc [...]
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
    // Chỉ chạy logic này khi danh sách categories đã được tải về từ API
    if (categories.length === 0) return;

    const currentId = categoryIdParam ? parseInt(categoryIdParam, 10) : 'all';

    if (currentId !== 'all' && !Number.isNaN(currentId)) {
      const categoryExists = categories.some(c => c.categoryId === currentId);
      setSelectedCategoryId(categoryExists ? currentId : 'all');
    } else {
      setSelectedCategoryId('all');
    }
  }, [categoryIdParam, categories]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="text-lg text-gray-600">Đang tải sản phẩm...</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cửa hàng</h1>
        <p className="text-gray-600">Khám phá bộ sưu tập sản phẩm thủ công của chúng tôi</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 pr-4 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {[{ categoryId: 'all', categoryName: 'Tất cả' }, ...categories].map((category) => (
            <button
              key={category.categoryId}
              onClick={() => {
                if (category.categoryId === 'all') {
                  router.push('/shop/products');
                } else {
                  router.push(`/shop/products?categoryId=${category.categoryId}`);
                }
                setSelectedCategoryId(category.categoryId as number | 'all');
              }}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategoryId === category.categoryId
                  ? "bg-[#0f172a] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.categoryName}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-gray-600">
        Tìm thấy <span className="font-semibold">{filteredProducts.length}</span> sản phẩm
        {selectedCategoryId !== 'all' &&
          ` trong danh mục "${categories.find(c => c.categoryId === selectedCategoryId)?.categoryName || ''}"`
        }
        {searchQuery && (
          selectedCategoryId !== 'all'
            ? ` phù hợp với "${searchQuery}"`
            : ` phù hợp với "${searchQuery}"`
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/shop/id/${product.id}`}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 group"
            >
              <div className="relative w-full h-48 bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.productName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">{product.categoryName}</div>
                <h3 className="text-sm font-medium mb-1 line-clamp-2 group-hover:text-[#0f172a] transition-colors">
                  {product.productName}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 mb-3">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#0f172a]">
                    ₫{Number(product.price).toLocaleString("vi-VN")}
                  </div>
                  <div className="text-xs bg-[#0f172a] text-white px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Chi tiết →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-600">
            {searchQuery
              ? `Không có sản phẩm nào phù hợp với "${searchQuery}". Hãy thử từ khóa khác.`
              : "Hãy thử chọn danh mục khác hoặc tìm kiếm sản phẩm."
            }
          </p>
        </div>
      )}
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
            <div className="text-lg text-gray-600">Đang tải...</div>
          </div>
        </main>
      }>
        <ProductsPageContent />
      </Suspense>
      <Footer />
    </div>
  );
}
