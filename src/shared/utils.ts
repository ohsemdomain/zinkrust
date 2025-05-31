import { APP_CONFIG } from './config';
import { ProductCategoryNames, ProductStatus } from './constants';

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
