import { z } from 'zod';
import { ProductCategory, ProductStatus } from './constants';

// Shared validation schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z
    .number()
    .refine(
      (val) =>
        Object.values(ProductCategory).includes(
          val as (typeof ProductCategory)[keyof typeof ProductCategory],
        ),
      {
        message: 'Invalid category',
      },
    ),
  price_cents: z
    .number()
    .int('Price must be a whole number of cents')
    .positive('Price must be positive'),
  description: z.string().optional(),
});

export const updateProductSchema = createProductSchema.extend({
  id: z.number().positive('Invalid product ID'),
  status: z
    .number()
    .refine(
      (val) =>
        Object.values(ProductStatus).includes(
          val as (typeof ProductStatus)[keyof typeof ProductStatus],
        ),
      {
        message: 'Invalid status',
      },
    ),
});

export const paginationSchema = z.object({
  per_page: z.number().positive().max(100).default(25),
  page: z.number().min(0).default(0),
});

export const productFilterSchema = paginationSchema.extend({
  filter_by: z.enum(['active', 'inactive', 'all']).default('active'),
  sort_column: z
    .enum(['name', 'category', 'status', 'created_at', 'updated_at'])
    .default('created_at'),
  sort_order: z.enum(['ASC', 'DESC']).default('DESC'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
