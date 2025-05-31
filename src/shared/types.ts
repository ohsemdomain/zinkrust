import type { z } from 'zod';
import type { createProductSchema, updateProductSchema, productFilterSchema } from './schemas';

// Product domain types
export interface Product {
  id: number;
  name: string;
  category: number;
  price_cents: number;
  description: string | null;
  status: number;
  created_at: number;
  updated_at: number;
}

// Schema-derived types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilter = z.infer<typeof productFilterSchema>;

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}