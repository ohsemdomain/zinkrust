import { z } from 'zod';

// Re-export everything from shared types
export * from '../../shared/types';
export { createProductSchema, updateProductSchema } from '../../shared/schemas';

// Product schema for validation
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.number(),
  price_cents: z.number().int().positive(),
  description: z.string().nullable(),
  status: z.number(),
  created_at: z.number(),
  updated_at: z.number(),
});

// Worker-specific schemas
export const deleteProductSchema = z.object({
  id: z.number().positive(),
});

export type DeleteProduct = z.infer<typeof deleteProductSchema>;
