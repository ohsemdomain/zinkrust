/**
 * UI Integration Tests for Price Migration
 *
 * Tests UI behavior and sorting functionality
 */

import { describe, expect, test } from 'bun:test';
import { productFilterSchema } from '../shared/schemas';

describe('UI Integration Tests', () => {
  // Test: Sort options → verify no price sorting options appear
  test('should not allow price sorting in schema validation', () => {
    // Valid sort columns (price should not be included)
    const validSortColumns = [
      'name',
      'category',
      'status',
      'created_at',
      'updated_at',
    ];

    for (const column of validSortColumns) {
      const validInput = {
        filter_by: 'active' as const,
        page: 0,
        per_page: 25,
        sort_column: column,
        sort_order: 'ASC' as const,
      };

      expect(() => productFilterSchema.parse(validInput)).not.toThrow();
    }
  });

  test('should reject price sorting in schema validation', () => {
    const invalidInput = {
      filter_by: 'active' as const,
      page: 0,
      per_page: 25,
      sort_column: 'price', // This should be rejected
      sort_order: 'ASC' as const,
    };

    expect(() => productFilterSchema.parse(invalidInput)).toThrow();
  });

  test('should reject price_cents sorting in schema validation', () => {
    const invalidInput = {
      filter_by: 'active' as const,
      page: 0,
      per_page: 25,
      sort_column: 'price_cents', // This should also be rejected
      sort_order: 'ASC' as const,
    };

    expect(() => productFilterSchema.parse(invalidInput)).toThrow();
  });

  // Test default sort behavior
  test('should default to created_at sorting when no sort specified', () => {
    const input = {
      filter_by: 'active' as const,
      page: 0,
      per_page: 25,
      // No sort_column specified
    };

    const result = productFilterSchema.parse(input);
    expect(result.sort_column).toBe('created_at');
    expect(result.sort_order).toBe('DESC');
  });

  // Test all valid sort options
  test('should support all valid sort columns', () => {
    const validColumns = [
      'name',
      'category',
      'status',
      'created_at',
      'updated_at',
    ];

    for (const column of validColumns) {
      const input = {
        filter_by: 'active' as const,
        page: 0,
        per_page: 25,
        sort_column: column,
        sort_order: 'DESC' as const,
      };

      const result = productFilterSchema.parse(input);
      expect(result.sort_column).toBe(column);
    }
  });
});
