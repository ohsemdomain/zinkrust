// ==================== BARREL EXPORTS ====================

// Constants
export * from './constants';

// Configuration  
export * from './config';

// Schemas
export * from './schemas';

// Types and interfaces
export * from './types';

// Utilities
export * from './utils';

// ==================== SCHEMA INFERENCE TYPES ====================
// Re-export properly typed schema inference types
import type { z } from 'zod';
import type { createProductSchema, updateProductSchema, productFilterSchema } from './schemas';

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilter = z.infer<typeof productFilterSchema>;