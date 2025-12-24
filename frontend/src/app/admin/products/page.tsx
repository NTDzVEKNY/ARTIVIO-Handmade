'use client';

import { ProductsClient } from '@/components/admin/products/ProductsClient';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/services/api';
import { RawProductResponse } from '@/types/apiTypes';
import { mapToProduct } from '@/utils/ProductMapper';
import { Product } from '@/types';
import { PaginatedProductResponse } from '@/types/apiTypes';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // Fetch all products with admin=true to get products regardless of status
      // Using a large size to get all products (you may want to implement pagination later)
      const response = await fetchApi<PaginatedProductResponse>('/products?admin=true&page=0&size=1000');
      const mappedProducts = response.content.map(mapToProduct);
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [refreshKey]);

  // Listen for custom refresh event
  useEffect(() => {
    const handleRefresh = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    // Listen for custom refresh event
    window.addEventListener('products-refresh', handleRefresh);
    
    // Also listen for focus event to refresh when user returns to tab
    const handleFocus = () => {
      setRefreshKey(prev => prev + 1);
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('products-refresh', handleRefresh);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f172a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return <ProductsClient data={products} />;
};

export default ProductsPage;