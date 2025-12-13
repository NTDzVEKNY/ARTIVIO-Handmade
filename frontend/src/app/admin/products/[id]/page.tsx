
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Product, Category } from '@/types';
import { fetchApi } from '@/services/api';
import Image from 'next/image';
import toast, { Toast } from 'react-hot-toast';
import { ArrowLeft, Trash, Save, XCircle, AlertTriangle, Image as ImageIcon } from 'lucide-react';

const ProductDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const productNameRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (id) {
      const getProduct = async () => {
        try {
          setLoading(true);
          // Lấy dữ liệu sản phẩm và danh mục song song để tối ưu
          const [productData, categoriesData] = await Promise.all([
            fetchApi<Product>(`/products/${id}`),
            fetchApi<Category[]>(`/categories`)
          ]);
          setProduct(productData || null);
          setFormData(productData || null);
          setCategories(categoriesData || []);
        } catch (error) {
          console.error("Failed to fetch product and categories", error);
        } finally {
          setLoading(false);
        }
      };
      getProduct();
    }
  }, [id]);

  // Check for changes between original product and form data
  useEffect(() => {
    if (product && formData) {
      const hasChanged = JSON.stringify(product) !== JSON.stringify(formData);
      setIsDirty(hasChanged);
    } else {
      setIsDirty(false);
    }
  }, [formData, product]);

  // Prompt user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'Bạn có các thay đổi chưa được lưu. Bạn có chắc muốn rời đi?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  // Auto-resize textareas to fit content
  useEffect(() => {
    if (productNameRef.current) {
      productNameRef.current.style.height = 'auto';
      productNameRef.current.style.height = `${productNameRef.current.scrollHeight}px`;
    }
    if (descriptionRef.current) {
      descriptionRef.current.style.height = 'auto';
      descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
    // We run this effect when formData changes, which covers both initial load and user input.
  }, [formData]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        if (!prev) return null;
        const newValue = ['price', 'stock_quantity', 'category_id'].includes(name) ? Number(value) : value;
        return { ...prev, [name]: newValue };
    });
  };

  const confirmAction = (message: React.ReactNode, onConfirm: () => void) => {
    toast(
      (t: Toast) => (
        <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-lg">
          <div className="text-center">{message}</div>
          <div className="flex gap-4">
            <button
              className="px-6 py-2 text-sm font-semibold rounded-full text-white bg-red-600 hover:bg-red-700 transition-colors"
              onClick={() => {
                onConfirm();
                toast.dismiss(t.id);
              }}
            >
              Xác nhận
            </button>
            <button
              className="px-6 py-2 text-sm font-semibold rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
              onClick={() => toast.dismiss(t.id)}
            >
              Hủy
            </button>
          </div>
        </div>
      ),
      { duration: Infinity } // Thông báo sẽ không tự đóng
    );
  };

  const confirmDeleteAction = (productName: string, onConfirm: () => void) => {
    toast(
      (t: Toast) => (
        <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-2xl border border-red-300 max-w-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <h3 className="text-2xl font-bold text-red-700">Xác nhận xóa</h3>
          </div>
          <p className="text-center text-gray-700 mt-2">
            Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm <strong className="text-red-600">&quot;{productName}&quot;</strong> không?
          </p>
          <div className="flex w-full justify-center gap-4 mt-4">
            <button
              className="px-6 py-2 text-base font-semibold rounded-full text-white bg-red-600 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              onClick={() => {
                onConfirm();
                toast.dismiss(t.id);
              }}
            >
              Xóa vĩnh viễn
            </button>
            <button
              className="px-6 py-2 text-base font-semibold rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              onClick={() => toast.dismiss(t.id)}
            >
              Hủy
            </button>
          </div>
        </div>
      ),
      { 
        duration: Infinity,
      }
    );
  };

  const handleUpdate = async () => {
    if (!formData || !isDirty) return;

    // --- VALIDATION ---
    if (!formData.name.trim()) {
      toast.error('Tên sản phẩm không được để trống');
      return;
    }
    if (!formData.category_id) {
      toast.error('Vui lòng chọn danh mục');
      return;
    }
    if (formData.price < 0) {
      toast.error('Giá sản phẩm không được âm');
      return;
    }
    if (formData.stock_quantity < 0) {
      toast.error('Số lượng tồn kho không được âm');
      return;
    }
    if (!Number.isInteger(formData.stock_quantity)) {
      toast.error('Số lượng tồn kho phải là số nguyên');
      return;
    }
    if (!formData.image?.trim()) {
      toast.error('Vui lòng nhập đường dẫn hình ảnh');
      return;
    }
    try {
      new URL(formData.image);
    } catch {
      toast.error('Đường dẫn hình ảnh không hợp lệ (phải bắt đầu bằng http/https)');
      return;
    }

    setIsUpdating(true);
    try {
      const updatedProduct = await fetchApi<Product>(`/products/${formData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      setProduct(updatedProduct); // Update original state
      setFormData(updatedProduct); // Sync form state
      toast.success('Cập nhật thành công!');
    } catch (error) {
      console.error(`Failed to update product`, error);
      toast.error('Cập nhật thất bại.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    confirmDeleteAction(product.name, async () => {
      try {
          await fetchApi(`/products/${product.id}`, { method: 'DELETE' });
          toast.success('Xóa sản phẩm thành công.');
          router.push('/admin/products');
          router.refresh();
      } catch (error) {
          console.error("Failed to delete product", error);
          toast.error('Xóa sản phẩm thất bại.');
      }
  });
  };

  const handleCancel = () => {
    setFormData(product); // Revert changes
  };

  const handleBackNavigation = () => {
    if (isDirty) {
      confirmAction(
        <span>Các thay đổi cho sản phẩm <strong className="font-semibold">&quot;{formData?.name}&quot;</strong> sẽ không được lưu. Bạn có chắc chắn muốn quay lại?</span>,
        () => {
          router.push('/admin/products');
        }
      );
    } else {
      router.push('/admin/products');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải chi tiết sản phẩm...</div>;
  }

  if (!product || !formData) {
    return <div className="text-center py-10 text-red-500">Không tìm thấy sản phẩm.</div>;
  }
  
  return (
    <div className="space-y-8">
      {/* Product Details Card */}
      <div className="rounded-xl shadow-sm p-6 sm:p-8" style={{ backgroundColor: '#FDFBF7', border: '1px solid #E8D5B5' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Image */}
          <div className="md:col-span-1 flex flex-col">
            <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-inner bg-[#F7F1E8] flex items-center justify-center border border-[#E8D5B5]">
              {formData.image ? (
                <Image
                  src={formData.image}
                  alt={formData.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#6B4F3E] opacity-50">
                  <ImageIcon className="w-16 h-16 mb-2" />
                  <span className="font-medium">Chưa có hình ảnh</span>
                </div>
              )}
            </div>
            <div className="mt-4">
                <div className="text-sm font-medium" style={{color: '#6B4F3E'}}>URL Hình ảnh</div>
                <input
                  type="text"
                  name="image"
                  value={formData.image || ''}
                  onChange={handleFormChange}
                  className="w-full text-sm bg-transparent border-b-2 border-transparent focus:border-yellow-500 focus:outline-none"
                  style={{ color: '#3F2E23' }}
                />
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 items-start">
              <div className="md:col-span-2">
                  <div className="text-sm font-medium" style={{color: '#6B4F3E'}}>Tên sản phẩm</div>
                  <textarea
                    ref={productNameRef}
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full text-2xl font-bold bg-transparent border-b-2 border-transparent focus:border-yellow-500 focus:outline-none resize-none overflow-hidden"
                    style={{ color: '#3F2E23' }}
                  />
              </div>

              <div>
                  <div className="text-sm font-medium" style={{color: '#6B4F3E'}}>Danh mục</div>
                  <select
                    name="category_id"
                    value={formData.category_id || ''}
                    onChange={handleFormChange}
                    className="w-full font-semibold bg-transparent border-b-2 border-transparent focus:border-yellow-500 focus:outline-none pb-2 text-lg"
                    style={{ color: '#3F2E23' }}
                  >
                    {categories.map((category, index) => (
                      <option key={`${category.id}-${index}`} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
              </div>
            </div>
            
            <div>
                <div className="text-sm font-medium" style={{color: '#6B4F3E'}}>Mô tả</div>
                <textarea
                  ref={descriptionRef}
                  name="description"
                  value={formData.description || ''}
                  onChange={handleFormChange}
                  className="w-full text-lg bg-transparent border-b-2 border-transparent focus:border-yellow-500 focus:outline-none resize-none overflow-hidden"
                  style={{ color: '#6B4F3E' }}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{borderColor: '#E8D5B5'}}>
                <div>
                    <div className="text-sm font-medium" style={{color: '#6B4F3E'}}>Giá</div>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      className="w-full text-2xl font-semibold bg-transparent border-b-2 border-transparent focus:border-yellow-500 focus:outline-none"
                      style={{ color: '#D96C39' }}
                    />
                </div>
                <div>
                    <div className="text-sm font-medium" style={{color: '#6B4F3E'}}>Trạng thái</div>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="w-full font-semibold bg-transparent border-b-2 border-transparent focus:border-yellow-500 focus:outline-none"
                      style={{color: formData.status === 'ACTIVE' ? '#28a745' : '#6c757d'}}
                    >
                      <option value="ACTIVE">Đang hoạt động</option>
                      <option value="INACTIVE">Bị ẩn</option>
                    </select>
                </div>
                <div>
                    <div className="text-sm font-medium" style={{color: '#6B4F3E'}}>Số lượng tồn kho</div>
                    <input
                      type="number"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleFormChange}
                      className="w-full font-semibold bg-transparent border-b-2 border-transparent focus:border-yellow-500 focus:outline-none"
                      style={{ color: '#3F2E23' }}
                    />
                </div>
                <div>
                    <div className="text-sm font-medium" style={{color: '#6B4F3E'}}>Đã bán</div>
                    <div className="font-semibold" style={{color: '#3F2E23'}}>{formData.quantity_sold || 0}</div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header with back button and actions */}
      <div className="flex items-center justify-end space-x-4">
          <button
            onClick={handleBackNavigation}
            className="flex items-center px-4 py-2 text-sm font-medium rounded-full shadow-sm transition-all transform hover:scale-105"
            style={{ backgroundColor: '#F7F1E8', color: '#3F2E23', border: '1px solid #D96C39' }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </button>
          {isDirty && (
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="flex items-center px-6 py-3 text-sm font-medium rounded-full shadow-md text-gray-700 bg-gray-200 transition-all transform hover:scale-105 disabled:opacity-50"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Hủy
            </button>
          )}
          <button
            onClick={handleUpdate}
            disabled={!isDirty || isUpdating}
            className="flex items-center px-6 py-3 text-sm font-medium rounded-full shadow-md text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#D96C39' }}
          >
            <Save className="mr-2 h-4 w-4" />
            {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center px-6 py-3 text-sm font-medium rounded-full shadow-md text-white transition-all transform hover:scale-105"
            style={{ backgroundColor: '#dc3545' }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Xóa
          </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
