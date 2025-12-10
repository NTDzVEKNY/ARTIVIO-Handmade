'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category } from '@/types';
import { fetchApi } from '@/services/api';

// Common styles for form elements, to avoid repetition
const inputStyles: React.CSSProperties = {
  backgroundColor: '#FFF8F0',
  borderColor: '#D96C39',
  color: '#3F2E23',
  borderWidth: '1px',
  borderRadius: '9999px', // rounded-full
  padding: '0.75rem 1.5rem',
  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  transition: 'all 0.3s',
  width: '100%',
};

const selectStyles: React.CSSProperties = {
  ...inputStyles,
  padding: '0.75rem 1rem',
};

const labelStyles: React.CSSProperties = {
    color: '#3F2E23',
    fontSize: '0.875rem',
    fontWeight: 500,
    display: 'block',
    marginBottom: '0.5rem'
};

interface ProductEditFormProps {
  initialData: Product | null;
}

export const ProductEditForm: React.FC<ProductEditFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [productName, setProductName] = useState(initialData?.productName || '');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [stockQuantity, setStockQuantity] = useState(initialData?.stockQuantity || 0);
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || 0);
  const [description, setDescription] = useState(initialData?.description || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [status, setStatus] = useState(initialData?.status || 'ACTIVE');

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const cats = await fetchApi<Category[]>('/categories');
        setCategories(cats);
        if (initialData === null && cats.length > 0) {
            setCategoryId(cats[0].categoryId);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    getCategories();
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
        productName,
        price,
        stockQuantity,
        categoryId,
        description,
        image,
        status,
        quantitySold: initialData?.quantitySold || 0
    };

    try {
        if (initialData) {
            await fetchApi(`/products/${initialData.id}`, { method: 'PUT', body: JSON.stringify(productData) });
        } else {
            // This form is for editing only
        }
        router.push(`/admin/products/${initialData?.id}`);
        router.refresh();
    } catch (error) {
        console.error("Failed to save product", error);
    } finally {
        setLoading(false);
    }
  };

  if (!initialData) {
    return <div>Không có dữ liệu sản phẩm.</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        
        <div>
          <label htmlFor="name" style={labelStyles}>Tên sản phẩm</label>
          <p className="text-sm text-gray-500 mb-2">Hiện tại: {initialData.productName}</p>
          <input id="name" value={productName} onChange={(e) => setProductName(e.target.value)} disabled={loading} placeholder="Tên sản phẩm mới" style={inputStyles} className="focus:ring-2 focus:ring-[#D96C39] focus:border-transparent focus:outline-none" />
        </div>
        
        <div>
          <label htmlFor="price" style={labelStyles}>Giá</label>
          <p className="text-sm text-gray-500 mb-2">Hiện tại: {initialData.price}</p>
          <input id="price" value={price} onChange={(e) => setPrice(Number(e.target.value))} type="number" disabled={loading} placeholder="Giá mới" style={inputStyles} className="focus:ring-2 focus:ring-[#D96C39] focus:border-transparent focus:outline-none" />
        </div>
        
        <div>
          <label htmlFor="stock" style={labelStyles}>Số lượng tồn kho</label>
          <p className="text-sm text-gray-500 mb-2">Hiện tại: {initialData.stockQuantity}</p>
          <input id="stock" value={stockQuantity} onChange={(e) => setStockQuantity(Number(e.target.value))} type="number" disabled={loading} placeholder="Số lượng mới" style={inputStyles} className="focus:ring-2 focus:ring-[#D96C39] focus:border-transparent focus:outline-none" />
        </div>
        
        <div>
          <label htmlFor="category" style={labelStyles}>Danh mục</label>
          <p className="text-sm text-gray-500 mb-2">Hiện tại: {categories.find(c => c.categoryId === initialData.categoryId)?.categoryName}</p>
          <select
            id="category"
            disabled={loading}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            value={String(categoryId)}
            style={selectStyles}
            className="focus:ring-2 focus:ring-[#D96C39] focus:border-transparent focus:outline-none"
          >
            {categories.map((category) => (
              <option key={category.categoryId} value={String(category.categoryId)}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div>
            <label htmlFor="status" style={labelStyles}>Trạng thái</label>
            <p className="text-sm text-gray-500 mb-2">Hiện tại: {initialData.status}</p>
            <select disabled={loading} onChange={(e) => setStatus(e.target.value)} value={status} style={selectStyles} className="focus:ring-2 focus:ring-[#D96C39] focus:border-transparent focus:outline-none">
                <option value="ACTIVE">Hoạt động</option>
                <option value="HIDDEN">Ẩn</option>
            </select>
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="description" style={labelStyles}>Mô tả</label>
          <p className="text-sm text-gray-500 mb-2">Hiện tại: {initialData.description}</p>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} placeholder="Mô tả mới" style={{...inputStyles, borderRadius: '1.5rem', minHeight: '120px'}} className="focus:ring-2 focus:ring-[#D96C39] focus:border-transparent focus:outline-none" />
        </div>
        
        <div className="md:col-span-2">
            <label htmlFor="image" style={labelStyles}>Hình ảnh</label>
            <p className="text-sm text-gray-500 mb-2">Hiện tại: {initialData.image}</p>
            <input id="image" value={image} onChange={(e) => setImage(e.target.value)} disabled={loading} placeholder="Đường dẫn hình ảnh mới" style={inputStyles} className="focus:ring-2 focus:ring-[#D96C39] focus:border-transparent focus:outline-none" />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-6 py-3 text-sm font-medium rounded-full shadow-md transition-all transform hover:scale-105"
            style={{ backgroundColor: '#F7F1E8', color: '#3F2E23', border: '1px solid #D96C39' }}
        >
            Hủy
        </button>
        <button disabled={loading} className="px-6 py-3 text-sm font-medium rounded-full shadow-md text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: '#D96C39' }} type="submit">
            Lưu thay đổi
        </button>
      </div>
    </form>
  );
};