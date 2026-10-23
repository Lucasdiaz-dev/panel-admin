import { withGroupPrefix } from '@/constants/group';
import { request } from '@/services/http';
import type { Product, ProductInput } from '@/types/product';

export type ProductListParams = {
  offset?: number;
  limit?: number;
  title?: string;
  categoryId?: number;
};

function toQuery(params: ProductListParams): string {
  const search = new URLSearchParams();
  if (params.offset != null) search.set('offset', String(params.offset));
  if (params.limit != null) search.set('limit', String(params.limit));
  if (params.title) search.set('title', params.title);
  if (params.categoryId != null) search.set('categoryId', String(params.categoryId));
  const query = search.toString();
  return query ? `?${query}` : '';
}

function toBody(input: ProductInput): ProductInput {
  return {
    ...input,
    title: withGroupPrefix(input.title),
  };
}

export function getProducts(params: ProductListParams = {}): Promise<Product[]> {
  return request<Product[]>(`/products${toQuery(params)}`);
}

export function getProduct(id: number): Promise<Product> {
  return request<Product>(`/products/${id}`);
}

export function createProduct(input: ProductInput): Promise<Product> {
  return request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(toBody(input)),
  });
}

export function updateProduct(id: number, input: ProductInput): Promise<Product> {
  return request<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toBody(input)),
  });
}

export function deleteProduct(id: number): Promise<boolean> {
  return request<boolean>(`/products/${id}`, { method: 'DELETE' });
}
