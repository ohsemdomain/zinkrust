import { z } from 'zod';
import {
  APP_CONFIG,
  type Product,
  type ProductListResponse,
  createProductSchema,
  productFilterSchema,
  productSchema,
  updateProductSchema,
} from '../../shared';
import { DatabaseError, ValidationError, generateUniqueId, t } from '../trpc';

// ==================== SCHEMAS ====================
const deleteProductSchema = z.object({
  id: z.number().positive(),
});

// ==================== PRODUCTS ROUTER ====================
export const productsRouter = t.router({
  getAll: t.procedure
    .input(productFilterSchema.optional())
    .output(z.custom<ProductListResponse>())
    .query(async ({ ctx, input }) => {
      try {
        const {
          per_page = APP_CONFIG.pagination.defaultPageSize,
          page = 0,
          filter_by = 'active',
          sort_column = 'created_at',
          sort_order = 'DESC',
        } = input || {};

        const offset = page * per_page;

        // Build WHERE clause based on status filter
        let whereClause = '';
        if (filter_by === 'active') {
          whereClause = 'WHERE status = 1';
        } else if (filter_by === 'inactive') {
          whereClause = 'WHERE status = 0';
        }

        // Validate sort column for security
        const validSortColumn = APP_CONFIG.products.allowedSortColumns.includes(
          sort_column as (typeof APP_CONFIG.products.allowedSortColumns)[number],
        )
          ? sort_column
          : 'created_at';
        const validSortOrder = sort_order === 'ASC' ? 'ASC' : 'DESC';

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
        const { results: countResults } =
          await ctx.env.DB.prepare(countQuery).all();
        const total = (countResults[0] as { total: number }).total;

        // Get paginated results
        const query = `
          SELECT * FROM products 
          ${whereClause}
          ORDER BY ${validSortColumn} ${validSortOrder}
          LIMIT ? OFFSET ?
        `;

        const { results } = await ctx.env.DB.prepare(query)
          .bind(per_page, offset)
          .all();

        // Validate each result with proper schema
        const validatedResults = results.map((result: unknown) => {
          try {
            return productSchema.parse(result);
          } catch (error) {
            console.error('Product validation error:', error, 'Data:', result);
            throw ValidationError('Invalid product data from database');
          }
        });

        return {
          products: validatedResults,
          total,
          hasMore: offset + per_page < total,
          currentPage: page,
          totalPages: Math.ceil(total / per_page),
          perPage: per_page,
        };
      } catch (error) {
        console.error('Database error:', error);
        throw error;
      }
    }),

  getById: t.procedure
    .input(z.object({ id: z.number().positive() }))
    .output(z.custom<Product>())
    .query(async ({ ctx, input }) => {
      try {
        const { results } = await ctx.env.DB.prepare(
          'SELECT * FROM products WHERE id = ?',
        )
          .bind(input.id)
          .all();

        if (results.length === 0) {
          throw ValidationError(`Product with ID ${input.id} not found`);
        }

        // Validate the result with proper schema
        try {
          return productSchema.parse(results[0]);
        } catch (error) {
          console.error(
            'Product validation error:',
            error,
            'Data:',
            results[0],
          );
          throw ValidationError('Invalid product data from database');
        }
      } catch (error) {
        console.error('Database error:', error);
        throw error;
      }
    }),

  create: t.procedure
    .input(createProductSchema)
    .output(z.custom<Product>())
    .mutation(async ({ ctx, input }) => {
      try {
        const { minId, maxId, idGenerationMaxAttempts } = APP_CONFIG.products;
        const productId = await generateUniqueId(
          ctx.env.DB,
          'products',
          minId,
          maxId,
          idGenerationMaxAttempts,
        );

        const { results } = await ctx.env.DB.prepare(
          `INSERT INTO products (id, name, category, price_cents, description, status) 
           VALUES (?, ?, ?, ?, ?, ?) 
           RETURNING *`,
        )
          .bind(
            productId,
            input.name,
            input.category,
            input.price_cents,
            input.description || null,
            1, // Always create as active
          )
          .all();

        if (results.length === 0) {
          throw DatabaseError('Failed to create product');
        }

        // Validate the created product
        try {
          return productSchema.parse(results[0]);
        } catch (error) {
          console.error(
            'Created product validation error:',
            error,
            'Data:',
            results[0],
          );
          throw DatabaseError('Failed to validate created product');
        }
      } catch (error) {
        console.error('Database error:', error);
        throw error;
      }
    }),

  update: t.procedure
    .input(updateProductSchema)
    .output(z.custom<Product>())
    .mutation(async ({ ctx, input }) => {
      try {
        const { results } = await ctx.env.DB.prepare(
          `UPDATE products 
           SET name = ?, category = ?, price_cents = ?, description = ?, status = ?, updated_at = unixepoch()
           WHERE id = ? 
           RETURNING *`,
        )
          .bind(
            input.name,
            input.category,
            input.price_cents,
            input.description || null,
            input.status,
            input.id,
          )
          .all();

        if (results.length === 0) {
          throw DatabaseError('Failed to update product');
        }

        // Validate the updated product
        try {
          return productSchema.parse(results[0]);
        } catch (error) {
          console.error(
            'Updated product validation error:',
            error,
            'Data:',
            results[0],
          );
          throw DatabaseError('Failed to validate updated product');
        }
      } catch (error) {
        console.error('Update error:', error);
        throw error;
      }
    }),

  delete: t.procedure
    .input(deleteProductSchema)
    .output(z.object({ success: z.boolean(), id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if product exists
        const existingCheck = await ctx.env.DB.prepare(
          'SELECT id FROM products WHERE id = ? LIMIT 1',
        )
          .bind(input.id)
          .all();

        if (existingCheck.results.length === 0) {
          throw ValidationError(`Product with ID ${input.id} not found`);
        }

        // Soft delete by setting status to 0
        const { success } = await ctx.env.DB.prepare(
          'UPDATE products SET status = 0, updated_at = unixepoch() WHERE id = ?',
        )
          .bind(input.id)
          .run();

        if (!success) {
          throw DatabaseError('Failed to delete product');
        }

        return { success: true, id: input.id };
      } catch (error) {
        console.error('Delete error:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw DatabaseError('Failed to delete product');
      }
    }),
});
