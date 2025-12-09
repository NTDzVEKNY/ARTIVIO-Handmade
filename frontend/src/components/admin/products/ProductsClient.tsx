'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Product, Category } from '@/types';
import { fetchApi } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/app/admin/products/columns';

// --- Filter Definitions ---
const PRICE_RANGES = [
  { id: 'all', label: 'Mọi mức giá', min: 0, max: Infinity },
  { id: 'under-100k', label: 'Dưới 100.000đ', min: 0, max: 100000 },
  { id: '100k-200k', label: '100.000 - 200.000đ', min: 100000, max: 200000 },
  { id: '200k-500k', label: '200.000 - 500.000đ', min: 200000, max: 500000 },
  { id: 'over-500k', label: 'Trên 500.000đ', min: 500000, max: Infinity },
];

const SORT_OPTIONS = [
  { id: 'featured', label: 'Nổi bật (bán chạy)' },
  { id: 'price-asc', label: 'Giá: Thấp đến Cao' },
  { id: 'price-desc', label: 'Giá: Cao đến Thấp' },
  { id: 'name-asc', label: 'Tên: A-Z' },
  { id: 'name-desc', label: 'Tên: Z-A' },
];

// --- Reusable Styled Components (as per new pattern) ---
const inputStyles: React.CSSProperties = {
  backgroundColor: '#FFF8F0',
  borderColor: '#D96C39',
  color: '#3F2E23',
  borderWidth: '1px',
  borderRadius: '9999px',
  padding: '0.5rem 1rem',
  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  width: '100%',
};

const selectStyles: React.CSSProperties = {
    ...inputStyles,
    paddingRight: '2.5rem',
    appearance: 'none',
};

// --- Main Component ---
interface ProductsClientProps {
  data: Product[];
}

export const ProductsClient: React.FC<ProductsClientProps> = ({ data }) => {
  const router = useRouter();

  // --- State for Filters ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<'all' | number>('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCategories = async () => {
      try {
        setIsLoading(true);
        const cats = await fetchApi<Category[]>('/categories');
        setCategories(cats);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setIsLoading(false);
      }
    };
    getCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    return data
      .filter(product => {
        const matchesCategory = selectedCategoryId === 'all' || product.categoryId === selectedCategoryId;
        
        const matchesSearch = searchQuery === '' ||
          product.productName.toLowerCase().includes(searchQuery.toLowerCase());

        const priceRange_ = PRICE_RANGES.find(r => r.id === priceRange);
        const price = Number(product.price) || 0;
        const matchesPrice = priceRange_ ? (price >= priceRange_.min && price <= priceRange_.max) : true;

        return matchesCategory && matchesSearch && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return (Number(a.price) || 0) - (Number(b.price) || 0);
          case 'price-desc':
            return (Number(b.price) || 0) - (Number(a.price) || 0);
          case 'name-asc':
            return a.productName.localeCompare(b.productName);
          case 'name-desc':
            return b.productName.localeCompare(a.productName);
          case 'featured':
          default:
            return (b.quantitySold || 0) - (a.quantitySold || 0);
        }
      });
  }, [data, searchQuery, selectedCategoryId, priceRange, sortBy]);
  
  const title = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return `Tất cả sản phẩm (${filteredProducts.length})`;
    }
    const category = categories.find(c => c.categoryId === selectedCategoryId);
    const categoryName = category ? category.categoryName : 'Sản phẩm';
    return `${categoryName} (${filteredProducts.length})`;
  }, [selectedCategoryId, categories, filteredProducts.length]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#3F2E23' }}>
            {title}
          </h1>
          <p className="text-sm" style={{ color: '#6B4F3E' }}>
            Quản lý và lọc sản phẩm cho cửa hàng của bạn.
          </p>
        </div>
        <button
          onClick={() => router.push(`/admin/products/new`)}
          className="px-6 py-3 text-sm font-medium rounded-full shadow-md text-white transition-all transform hover:scale-105"
          style={{ backgroundColor: '#D96C39' }}
        >
          <Plus className="mr-2 h-4 w-4 inline-block" />
          Thêm mới
        </button>
      </div>

      {/* Filters UI */}
      <div className="space-y-6 p-6 rounded-xl" style={{ backgroundColor: '#FDFBF7', border: '1px solid #E8D5B5' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="md:col-span-3">
                <label htmlFor="search" className="block text-sm font-medium mb-2" style={{color: '#3F2E23'}}>Tìm kiếm</label>
                <input
                    id="search"
                    type="text"
                    placeholder="Tìm theo tên sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={inputStyles}
                    className="focus:ring-2 focus:ring-[#D96C39] focus:border-transparent focus:outline-none"
                />
            </div>
            {/* Price Range */}
            <div>
                <label htmlFor="price-range" className="block text-sm font-medium mb-2" style={{color: '#3F2E23'}}>Lọc theo giá</label>
                 <select id="price-range" value={priceRange} onChange={e => setPriceRange(e.target.value)} style={selectStyles} className="focus:ring-2 focus:ring-[#D96C39] focus:border-transparent focus:outline-none">
                    {PRICE_RANGES.map(range => <option key={range.id} value={range.id}>{range.label}</option>)}
                </select>
            </div>
            {/* Sort By */}
            <div>
                <label htmlFor="sort-by" className="block text-sm font-medium mb-2" style={{color: '#3F2E23'}}>Sắp xếp theo</label>
                <select id="sort-by" value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyles} className="focus:ring-2 focus:ring-[#D96C39] focus:border-transparent focus:outline-none">
                    {SORT_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
            </div>
        </div>

        {/* Category Filter */}
        <div>
            <label className="block text-sm font-medium mb-3" style={{color: '#3F2E23'}}>Lọc theo danh mục</label>
            {isLoading ? (
                 <div className="text-sm" style={{ color: '#6B4F3E' }}>Đang tải danh mục...</div>
            ) : (
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setSelectedCategoryId('all')}
                        className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-sm border"
                        style={{
                            backgroundColor: selectedCategoryId === 'all' ? '#D96C39' : '#F7F1E8',
                            color: selectedCategoryId === 'all' ? 'white' : '#3F2E23',
                            borderColor: selectedCategoryId === 'all' ? '#D96C39' : '#D96C39'
                        }}
                    >
                        Tất cả
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.categoryId}
                            onClick={() => setSelectedCategoryId(category.categoryId)}
                            className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-sm border"
                            style={{
                                backgroundColor: selectedCategoryId === category.categoryId ? '#D96C39' : '#F7F1E8',
                                color: selectedCategoryId === category.categoryId ? 'white' : '#3F2E23',
                                borderColor: selectedCategoryId === category.categoryId ? '#D96C39' : '#D96C39'
                            }}
                        >
                            {category.categoryName}
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>
      
      {/* Product Table */}
      <div className="rounded-xl" style={{ backgroundColor: '#FDFBF7', border: '1px solid #E8D5B5' }}>
        <DataTable columns={columns} data={filteredProducts} />
      </div>
    </div>
  );
};