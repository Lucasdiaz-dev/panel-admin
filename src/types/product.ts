import type { Category } from '@/types/category';

export type Product = {
  id: number;
  title: string;
  slug: string;
  price: number;
  description: string;
  images: string[];
  category: Category;
  creationAt: string;
  updatedAt: string;
};

export type ProductInput = {
  title: string;
  price: number;
  description: string;
  categoryId: number;
  images: string[];
};
