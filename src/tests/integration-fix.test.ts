/**
 * Integration Test for Price Form Fix
 *
 * Tests that the form correctly handles dollars without double conversion
 */

import { describe, expect, test } from 'bun:test';
import { createProductSchema } from '../shared/schemas';
import { PriceUtils } from '../shared/utils/price';

describe('Integration Fix Tests', () => {
  test('should handle form submission correctly - user enters $1.00', () => {
    // Simulate form submission: user enters $1.00 in form
    const formData = {
      name: 'Test Product',
      category: 1,
      price_cents: 1.0, // Form sends dollars to schema
      description: 'Test',
    };

    // Schema should convert dollars to cents
    const result = createProductSchema.parse(formData);

    // Should be 100 cents, not 10000
    expect(result.price_cents).toBe(100);

    // When displayed, should show $1.00
    expect(PriceUtils.formatPrice(result.price_cents)).toBe('$1.00');
  });

  test('should handle form submission correctly - user enters $12.99', () => {
    // Simulate form submission: user enters $12.99 in form
    const formData = {
      name: 'Test Product',
      category: 1,
      price_cents: 12.99, // Form sends dollars to schema
      description: 'Test',
    };

    // Schema should convert dollars to cents
    const result = createProductSchema.parse(formData);

    // Should be 1299 cents
    expect(result.price_cents).toBe(1299);

    // When displayed, should show $12.99
    expect(PriceUtils.formatPrice(result.price_cents)).toBe('$12.99');
  });

  test('should handle edit form initialization correctly', () => {
    // Simulate product from database (stored as cents)
    const productFromDB = {
      id: 1,
      name: 'Test Product',
      price_cents: 1299, // 1299 cents = $12.99
      category: 1,
      description: 'Test',
      status: 1,
      created_at: 123456,
      updated_at: 123456,
    };

    // Form should display this as dollars
    const dollarsForForm = productFromDB.price_cents / 100;
    expect(dollarsForForm).toBe(12.99);

    // When user submits form, it goes back to schema as dollars
    const formSubmission = {
      name: productFromDB.name,
      category: productFromDB.category,
      price_cents: dollarsForForm, // Form sends dollars
      description: productFromDB.description,
    };

    // Schema converts back to cents
    const result = createProductSchema.parse(formSubmission);
    expect(result.price_cents).toBe(1299);
  });

  test('should prevent double conversion issue', () => {
    // This test ensures we don\'t have the double conversion bug
    const userInput = 10.0; // User enters $10.00

    // Form sends dollars to schema (not pre-converted cents)
    const schemaInput = {
      name: 'Test',
      category: 1,
      price_cents: userInput, // 10.00 (dollars)
      description: 'Test',
    };

    // Schema converts to cents
    const result = createProductSchema.parse(schemaInput);

    // Should be 1000 cents ($10.00), NOT 100000 cents ($1000.00)
    expect(result.price_cents).toBe(1000);
    expect(PriceUtils.formatPrice(result.price_cents)).toBe('$10.00');
  });
});
