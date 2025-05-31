import { PriceUtils, getCategoryName, getStatusText } from '../../shared';

// ==================== CONSOLIDATED FORMATTERS ====================
export const formatters = {
  /**
   * Format product category number to display name
   */
  categoryName: (category: number): string => {
    return getCategoryName(category);
  },

  /**
   * Format product status number to display text
   */
  statusName: (status: number): string => {
    return getStatusText(status);
  },

  /**
   * Format price from cents to currency display
   */
  price: (cents: number, locale?: string, currency?: string): string => {
    return PriceUtils.formatPrice(cents, locale, currency);
  },

  /**
   * Format Unix timestamp to localized date string
   */
  date: (timestamp: number, locale = 'en-US'): string => {
    return new Date(timestamp * 1000).toLocaleDateString(locale);
  },

  /**
   * Format Unix timestamp to localized date and time string
   */
  dateTime: (timestamp: number, locale = 'en-US'): string => {
    return new Date(timestamp * 1000).toLocaleString(locale);
  },
};
