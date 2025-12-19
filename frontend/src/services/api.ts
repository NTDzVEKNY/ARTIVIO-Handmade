import { Product, Category } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
}

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'Something went wrong');
  }

  return response.json();
}

export type ProductResponse = {
  content: Product[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
};

export const getProducts = (params: {
  categoryId?: number | 'all';
  q?: string;
  sort?: string;
  page?: number;
  size?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params.categoryId && params.categoryId !== 'all') {
    queryParams.append('categoryId', String(params.categoryId));
  }
  if (params.q) {
    queryParams.append('q', params.q);
  }
  if (params.sort) {
    queryParams.append('sort', params.sort);
  }
  if (params.page !== undefined) {
    queryParams.append('page', String(params.page));
  }
  if (params.size !== undefined) {
    queryParams.append('size', String(params.size));
  }

  const queryString = queryParams.toString();
  return fetchApi<ProductResponse>(`/api/products${queryString ? `?${queryString}` : ''}`);
};
export const getCategories = () => fetchApi<Category[]>('/api/categories');
export const getProductById = (id: string) => fetchApi<Product>(`/api/products/${id}`);