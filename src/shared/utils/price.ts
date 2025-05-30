/**
 * Price utility functions for handling cents-based storage
 */
export const PriceUtils = {
  /**
   * Convert dollars to cents for storage
   * @param dollars - The dollar amount (e.g., 12.99)
   * @returns The amount in cents (e.g., 1299)
   */
  dollarsToCents: (dollars: number): number => {
    return Math.round(dollars * 100);
  },

  /**
   * Convert cents to dollars for display
   * @param cents - The amount in cents (e.g., 1299)
   * @returns The dollar amount (e.g., 12.99)
   */
  centsToDollars: (cents: number): number => {
    return cents / 100;
  },

  /**
   * Format cents as currency string
   * @param cents - The amount in cents (e.g., 1299)
   * @param locale - The locale for formatting (default: 'en-US')
   * @param currency - The currency code (default: 'USD')
   * @returns Formatted currency string (e.g., "$12.99")
   */
  formatPrice: (cents: number, locale = 'en-US', currency = 'USD'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(cents / 100);
  },

  /**
   * Parse user input to cents
   * @param input - User input as string or number (e.g., "12.99" or 12.99)
   * @returns The amount in cents (e.g., 1299)
   */
  parseInput: (input: string | number): number => {
    const dollars =
      typeof input === 'string' ? Number.parseFloat(input) : input;
    return Math.round(dollars * 100);
  },

  /**
   * Validate that a cents value is valid
   * @param cents - The amount in cents
   * @returns True if valid, false otherwise
   */
  isValidCents: (cents: number): boolean => {
    return Number.isInteger(cents) && cents >= 0;
  },
};
