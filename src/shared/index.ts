// ==================== CONSOLIDATED SHARED FILE ====================
// Everything from shared/* consolidated into one file
// Frontend imports stay exactly the same!

import { z } from 'zod';

// ==================== PRODUCT CONSTANTS ====================
export const ProductCategory = {
  PACKAGING: 1,
  LABEL: 2,
  OTHER: 3,
} as const;

export const ProductStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
} as const;

// ==================== NAME MAPPINGS ====================
export const ProductCategoryNames: Record<number, string> = {
  [ProductCategory.PACKAGING]: 'Packaging',
  [ProductCategory.LABEL]: 'Label',
  [ProductCategory.OTHER]: 'Other',
};

export const ProductStatusNames: Record<number, string> = {
  [ProductStatus.ACTIVE]: 'Active',
  [ProductStatus.INACTIVE]: 'Inactive',
};

// ==================== APPLICATION CONFIG ====================
export const APP_CONFIG = {
  api: {
    endpoints: {
      trpc: import.meta.env.VITE_API_URL || '/trpc',
    },
    timeout: 30000,
    retries: 3,
    cors: {
      origin: import.meta.env.VITE_CORS_ORIGIN || '*',
      credentials: true,
    },
  },
  pagination: {
    defaultPageSize: 25,
    maxPageSize: 100,
  },
  ui: {
    notifications: {
      autoHideDelay: 5000,
    },
  },
  products: {
    idGenerationMaxAttempts: 10,
    priceDecimalPlaces: 2,
    minId: 100000000, // 9-digit minimum
    maxId: 999999999, // 9-digit maximum
    allowedSortColumns: [
      'name',
      'category',
      'status',
      'created_at',
      'updated_at',
    ] as const,
  },
  locale: {
    default: 'en-US',
    currency: 'USD',
  },
} as const;

// ==================== CORE INTERFACES ====================
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

export interface ProductListResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  perPage: number;
}

// ==================== CUSTOM VALIDATORS ====================
const productCategoryValidator = z
  .number()
  .int()
  .refine((val): val is 1 | 2 | 3 => {
    const values = Object.values(ProductCategory) as number[];
    return values.includes(val);
  }, 'Invalid category');

const productStatusValidator = z
  .number()
  .int()
  .refine((val): val is 0 | 1 => {
    const values = Object.values(ProductStatus) as number[];
    return values.includes(val);
  }, 'Invalid status');

// ==================== PRODUCT SCHEMAS ====================
export const productSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  category: productCategoryValidator,
  price_cents: z.number().int().positive(),
  description: z.string().nullable(),
  status: productStatusValidator,
  created_at: z.number().int().positive(),
  updated_at: z.number().int().positive(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: productCategoryValidator,
  price_cents: z.number().int().positive('Price must be positive'),
  description: z.string().optional(),
});

export const updateProductSchema = createProductSchema.extend({
  id: z.number().positive(),
  status: productStatusValidator,
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

// ==================== SCHEMA INFERENCE TYPES ====================
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilter = z.infer<typeof productFilterSchema>;

// ==================== PRICE UTILITIES ====================
export const PriceUtils = {
  dollarsToCents: (dollars: number): number => {
    return Math.round(dollars * 100);
  },

  centsToDollars: (cents: number): number => {
    return cents / 100;
  },

  formatPrice: (cents: number, locale?: string, currency?: string): string => {
    return new Intl.NumberFormat(locale || APP_CONFIG.locale.default, {
      style: 'currency',
      currency: currency || APP_CONFIG.locale.currency,
    }).format(cents / 100);
  },

  parseInput: (input: string | number): number => {
    const dollars =
      typeof input === 'string' ? Number.parseFloat(input) : input;
    return Math.round(dollars * 100);
  },

  isValidCents: (cents: number): boolean => {
    return Number.isInteger(cents) && cents >= 0;
  },
};

// ==================== PRODUCT UTILITIES ====================
export const getCategoryName = (category: number): string => {
  return ProductCategoryNames[category] || 'Unknown';
};

export const getStatusText = (status: number): string => {
  return status === ProductStatus.ACTIVE ? 'Active' : 'Inactive';
};

// ==================== FORM TRANSFORMERS ====================
export const formTransformers = {
  productFormToApi: (formData: {
    name: string;
    category: number;
    price: number; // dollars
    description?: string;
  }) => ({
    name: formData.name,
    category: formData.category,
    price_cents: PriceUtils.dollarsToCents(formData.price),
    description: formData.description,
  }),

  productApiToForm: (apiData: {
    name: string;
    category: number;
    price_cents: number;
    description?: string | null;
  }) => ({
    name: apiData.name,
    category: apiData.category,
    price: PriceUtils.centsToDollars(apiData.price_cents),
    description: apiData.description || '',
  }),
};

// ==================== ERROR HANDLING ====================
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}