import { z } from 'zod';
import { ProductCategory, ProductStatus } from './constants';

// ==================== PRODUCT SCHEMAS ====================
export const productSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  category: z
    .number()
    .int()
    .refine(
      (val) =>
        val === ProductCategory.PACKAGING ||
        val === ProductCategory.LABEL ||
        val === ProductCategory.OTHER,
      'Invalid category',
    ),
  price_cents: z.number().int().positive(),
  description: z.string().nullable(),
  status: z
    .number()
    .int()
    .refine(
      (val) => val === ProductStatus.ACTIVE || val === ProductStatus.INACTIVE,
      'Invalid status',
    ),
  created_at: z.number().int().positive(),
  updated_at: z.number().int().positive(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z
    .number()
    .int()
    .refine(
      (val) =>
        val === ProductCategory.PACKAGING ||
        val === ProductCategory.LABEL ||
        val === ProductCategory.OTHER,
      'Invalid category',
    ),
  price_cents: z.number().int().positive('Price must be positive'),
  description: z.string().optional(),
});

export const updateProductSchema = createProductSchema.extend({
  id: z.number().positive(),
  status: z
    .number()
    .int()
    .refine(
      (val) => val === ProductStatus.ACTIVE || val === ProductStatus.INACTIVE,
      'Invalid status',
    ),
});

// ==================== FILTER & PAGINATION SCHEMAS ====================
export const productFilterSchema = z.object({
  per_page: z.number().int().positive().max(100).default(25),
  page: z.number().int().min(0).default(0),
  filter_by: z.enum(['all', 'active', 'inactive']).default('active'),
  sort_column: z
    .enum(['name', 'category', 'status', 'created_at', 'updated_at'])
    .default('created_at'),
  sort_order: z.enum(['ASC', 'DESC']).default('DESC'),
});

export const paginationSchema = z.object({
  per_page: z.number().int().positive().max(100).default(25),
  page: z.number().int().min(0).default(0),
});