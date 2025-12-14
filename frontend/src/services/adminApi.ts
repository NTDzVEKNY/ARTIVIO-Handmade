import { Category } from '@/types';

import { fetchApi } from './api';

export interface ProductPayload {
  name: string;
  price: number;
  description: string;
  category_id: number;
  stock_quantity: number;
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