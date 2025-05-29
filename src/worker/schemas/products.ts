import { z } from 'zod';

// Product categories enum
export const ProductCategory = {
  PACKAGING: 1,
  LABEL: 2,
  OTHER: 3,
} as const;

// Product status enum
export const ProductStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
} as const;

// Zod schemas
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.number(),
  price: z.number(),
  description: z.string().nullable(),
  status: z.number(),
  created_at: z.number(),
  updated_at: z.number(),
});

export const createProductSchema = z.object({
  name: z.string().min(1),
  category: z.number().min(1).max(3),
  price: z.number().positive(),
  description: z.string().optional(),
  status: z.number().min(0).max(1).default(1),
});

export const updateProductSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  category: z.number().min(1).max(3),
  price: z.number().positive(),
  description: z.string().optional(),
  status: z.number().min(0).max(1),
});

export const deleteProductSchema = z.object({
  id: z.number().positive(),
});

export type Product = z.infer<typeof productSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type DeleteProduct = z.infer<typeof deleteProductSchema>;
