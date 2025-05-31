// Data transformation utilities for consistent data handling across the stack

// Re-export existing PriceUtils for backward compatibility
export { PriceUtils as priceTransformers } from './utils/price';

// Form data transformations
export const formTransformers = {
  // Transform form data (with dollars) to API input (with cents)
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

  // Transform API data (with cents) to form data (with dollars)
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

// Timestamp transformations
export const timestampTransformers = {
  toDate: (unixTimestamp: number): Date => new Date(unixTimestamp * 1000),
  fromDate: (date: Date): number => Math.floor(date.getTime() / 1000),
  format: (unixTimestamp: number): string => {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleDateString();
  },
};