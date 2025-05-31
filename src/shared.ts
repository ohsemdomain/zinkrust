import { z } from 'zod';

// ==================== CONSTANTS ====================
export const ProductCategory = {
  PACKAGING: 1,
  LABEL: 2,
  OTHER: 3,
} as const;

export const ProductStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
} as const;

export const ProductCategoryNames: Record<number, string> = {
  [ProductCategory.PACKAGING]: 'Packaging',
  [ProductCategory.LABEL]: 'Label',
  [ProductCategory.OTHER]: 'Other',
};

export const ProductStatusNames: Record<number, string> = {
  [ProductStatus.ACTIVE]: 'Active',
  [ProductStatus.INACTIVE]: 'Inactive',
};

// ==================== CONFIG ====================
export const APP_CONFIG = {
  api: {
    endpoints: {
      trpc: '/trpc',
    },
    timeout: 30000,
    retries: 3,
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
  },
} as const;

// ==================== SCHEMAS ====================
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

// ==================== TYPES ====================
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

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilter = z.infer<typeof productFilterSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

// ==================== UTILITIES ====================
export const PriceUtils = {
  dollarsToCents: (dollars: number): number => {
    return Math.round(dollars * 100);
  },

  centsToDollars: (cents: number): number => {
    return cents / 100;
  },

  formatPrice: (cents: number, locale = 'en-US', currency = 'USD'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(cents / 100);
  },

  parseInput: (input: string | number): number => {
    const dollars = typeof input === 'string' ? Number.parseFloat(input) : input;
    return Math.round(dollars * 100);
  },

  isValidCents: (cents: number): boolean => {
    return Number.isInteger(cents) && cents >= 0;
  },
};

export const getCategoryName = (category: number): string => {
  return ProductCategoryNames[category] || 'Unknown';
};

export const getStatusText = (status: number): string => {
  return ProductStatusNames[status] || 'Unknown';
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
    price_cents: Math.round(formData.price * 100),
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
    price: apiData.price_cents / 100,
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