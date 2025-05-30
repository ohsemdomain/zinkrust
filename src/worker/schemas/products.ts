import { z } from 'zod';
import type {
  createProductSchema,
  updateProductSchema,
} from '../../shared/schemas';

// Zod schemas
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.number(),
  price: z
    .union([z.number(), z.string()])
    .transform((val) =>
      typeof val === 'string' ? Number.parseFloat(val) : val,
    ),
  description: z.string().nullable(),
  status: z.number(),
  created_at: z.number(),
  updated_at: z.number(),
});

// Re-export shared schemas
export { createProductSchema, updateProductSchema } from '../../shared/schemas';

export const deleteProductSchema = z.object({
  id: z.number().positive(),
});

export type Product = z.infer<typeof productSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type DeleteProduct = z.infer<typeof deleteProductSchema>;
