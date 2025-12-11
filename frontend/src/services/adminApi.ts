import { Category } from '@/types';

import { fetchApi } from './api';

export interface ProductPayload {
  productName: string;
  price: number;
  description: string;
  categoryId: number;
  stockQuantity: number;
  image: string;
  status?: string;
}

export const createProduct = async (data: ProductPayload) => {
  return fetchApi('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
export const getCategories = async (): Promise<Category[]> => {
  return fetchApi('/categories');
};