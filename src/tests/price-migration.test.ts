/**
 * Price Field Migration Test Suite
 *
 * Tests the complete migration from DECIMAL to INTEGER (cents-based) storage
 * as specified in task.md
 */

import { describe, expect, test } from 'bun:test';
import { createProductSchema, updateProductSchema } from '../shared/schemas';
import { PriceUtils } from '../shared/utils/price';

describe('Price Migration Tests', () => {
  // Test 1: Create product with price $12.99 → verify stores as 1299 cents
  test('should convert $12.99 to 1299 cents when creating product', () => {
    const productInput = {
      name: 'Test Product',
      category: 1,
      price_cents: 12.99, // User inputs dollars
      description: 'Test description',
    };

    // Schema should transform dollars to cents
    const result = createProductSchema.parse(productInput);
    expect(result.price_cents).toBe(1299);
  });

  // Test 2: Display product with 1299 cents → verify shows "$12.99"
  test('should display 1299 cents as $12.99', () => {
    const priceInCents = 1299;
    const formatted = PriceUtils.formatPrice(priceInCents);
    expect(formatted).toBe('$12.99');
  });

  // Test 3: Utility functions work correctly
  test('should handle dollar to cents conversion correctly', () => {
    expect(PriceUtils.dollarsToCents(12.99)).toBe(1299);
    expect(PriceUtils.dollarsToCents(0.01)).toBe(1);
    expect(PriceUtils.dollarsToCents(100.0)).toBe(10000);
  });

  test('should handle cents to dollars conversion correctly', () => {
    expect(PriceUtils.centsToDollars(1299)).toBe(12.99);
    expect(PriceUtils.centsToDollars(1)).toBe(0.01);
    expect(PriceUtils.centsToDollars(10000)).toBe(100.0);
  });

  test('should parse user input correctly', () => {
    expect(PriceUtils.parseInput('12.99')).toBe(1299);
    expect(PriceUtils.parseInput(12.99)).toBe(1299);
    expect(PriceUtils.parseInput('0.01')).toBe(1);
    expect(PriceUtils.parseInput(0.01)).toBe(1);
  });

  // Test 4: Price validation works
  test('should reject negative prices', () => {
    expect(() => {
      createProductSchema.parse({
        name: 'Test Product',
        category: 1,
        price_cents: -1,
        description: 'Test description',
      });
    }).toThrow('Price must be positive');
  });

  test('should reject zero prices', () => {
    expect(() => {
      createProductSchema.parse({
        name: 'Test Product',
        category: 1,
        price_cents: 0,
        description: 'Test description',
      });
    }).toThrow('Price must be positive');
  });

  // Test 5: Update product schema works with cents
  test('should handle product updates with price_cents', () => {
    const updateInput = {
      id: 123,
      name: 'Updated Product',
      category: 1,
      price_cents: 25.5, // $25.50 should become 2550 cents
      description: 'Updated description',
      status: 1,
    };

    const result = updateProductSchema.parse(updateInput);
    expect(result.price_cents).toBe(2550);
  });

  // Test 6: Formatting edge cases
  test('should format edge case prices correctly', () => {
    expect(PriceUtils.formatPrice(1)).toBe('$0.01');
    expect(PriceUtils.formatPrice(10)).toBe('$0.10');
    expect(PriceUtils.formatPrice(100)).toBe('$1.00');
    expect(PriceUtils.formatPrice(999999)).toBe('$9,999.99');
  });

  // Test 7: Validation of cents values
  test('should validate cents correctly', () => {
    expect(PriceUtils.isValidCents(1299)).toBe(true);
    expect(PriceUtils.isValidCents(0)).toBe(true);
    expect(PriceUtils.isValidCents(-1)).toBe(false);
    expect(PriceUtils.isValidCents(12.99)).toBe(false); // Should be integer
  });

  // Test 8: Precision handling
  test('should handle floating point precision correctly', () => {
    // These tests ensure we avoid floating point precision errors
    expect(PriceUtils.parseInput(0.1 + 0.2)).toBe(30); // 0.30000000000000004 → 30 cents
    expect(PriceUtils.parseInput(9.99)).toBe(999);
    expect(PriceUtils.parseInput(99.99)).toBe(9999);
  });

  // Test 9: String input handling
  test('should handle string inputs correctly', () => {
    expect(PriceUtils.parseInput('12.99')).toBe(1299);
    expect(PriceUtils.parseInput('0.01')).toBe(1);
    expect(PriceUtils.parseInput('100')).toBe(10000);
    expect(PriceUtils.parseInput('100.00')).toBe(10000);
  });

  // Test 10: Schema transformation consistency
  test('should transform consistently through schema', () => {
    const testCases = [
      { input: 12.99, expected: 1299 },
      { input: '12.99', expected: 1299 },
      { input: 0.01, expected: 1 },
      { input: '0.01', expected: 1 },
      { input: 100, expected: 10000 },
      { input: '100', expected: 10000 },
    ];

    for (const { input, expected } of testCases) {
      const result = createProductSchema.parse({
        name: 'Test Product',
        category: 1,
        price_cents: input,
        description: 'Test',
      });
      expect(result.price_cents).toBe(expected);
    }
  });
});
