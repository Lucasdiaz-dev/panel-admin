import { request } from '@/services/http';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';

export function getCategories(): Promise<Category[]> {
  return request<Category[]>('/categories');
}

export function getCategory(id: number): Promise<Category> {
  return request<Category>(`/categories/${id}`);
}

export function getProductsByCategory(id: number): Promise<Product[]> {
  return request<Product[]>(`/categories/${id}/products`);
}
