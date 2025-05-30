import { z } from 'zod';
import { productFilterSchema } from '../../../shared/schemas';
import {
  createProductSchema,
  deleteProductSchema,
  productSchema,
  updateProductSchema,
} from '../../schemas/products';
import { generateUniqueProductId } from '../../utils/idGenerator';
import { createTRPCRouter, publicProcedure } from '../init';
import { DatabaseError, ValidationError } from '../types/errors';

export const productsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(productFilterSchema.optional())
    .output(
      z.object({
        products: z.array(productSchema),
        total: z.number(),
        hasMore: z.boolean(),
        currentPage: z.number(),
        totalPages: z.number(),
        perPage: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const {
          per_page = 25,
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
        // 'all' means no WHERE clause

        // Validate sort column for security
        const allowedColumns = [
          'name',
          'category',
          'status',
          'created_at',
          'updated_at',
        ];
        const safeColumn = allowedColumns.includes(sort_column)
          ? sort_column
          : 'created_at';
        const safeOrder = sort_order === 'ASC' ? 'ASC' : 'DESC';

        // Get total count
        const countResult = await ctx.env.DB.prepare(
          `SELECT COUNT(*) as count FROM products ${whereClause}`,
        ).first();
        const total = (countResult?.count as number) || 0;

        // Get paginated results with sorting
        const { results } = await ctx.env.DB.prepare(
          `SELECT * FROM products ${whereClause} ORDER BY ${safeColumn} ${safeOrder} LIMIT ? OFFSET ?`,
        )
          .bind(per_page, offset)
          .all();

        // Validate each result against the schema
        const validatedResults = results.map((result: unknown) => {
          try {
            return productSchema.parse(result);
          } catch (error) {
            console.error('Product validation error:', error, 'Data:', result);
            throw new ValidationError('Invalid product data from database');
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
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new DatabaseError('Failed to fetch products');
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().positive() }))
    .output(productSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { results } = await ctx.env.DB.prepare(
          'SELECT * FROM products WHERE id = ?',
        )
          .bind(input.id)
          .all();

        if (results.length === 0) {
          throw new ValidationError(`Product with ID ${input.id} not found`);
        }

        const result = results[0];
        return productSchema.parse(result);
      } catch (error) {
        console.error('Database error:', error);
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new DatabaseError('Failed to fetch product');
      }
    }),

  create: publicProcedure
    .input(createProductSchema)
    .output(productSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate input
        const validatedInput = createProductSchema.parse(input);

        // Generate unique 9-digit crypto ID
        const productId = await generateUniqueProductId(ctx.env.DB);

        const { results } = await ctx.env.DB.prepare(
          `INSERT INTO products (id, name, category, price_cents, description, status) 
           VALUES (?, ?, ?, ?, ?, ?) 
           RETURNING *`,
        )
          .bind(
            productId,
            validatedInput.name,
            validatedInput.category,
            validatedInput.price_cents,
            validatedInput.description || null,
            1, // Always create as active
          )
          .all();

        if (results.length === 0) {
          throw new DatabaseError('Failed to create product');
        }

        const result = results[0];
        return productSchema.parse(result);
      } catch (error) {
        console.error('Database error:', error);
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new DatabaseError('Failed to create product');
      }
    }),

  update: publicProcedure
    .input(updateProductSchema)
    .output(productSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate input
        const validatedInput = updateProductSchema.parse(input);

        // Check if product exists
        const existingCheck = await ctx.env.DB.prepare(
          'SELECT id FROM products WHERE id = ? LIMIT 1',
        )
          .bind(validatedInput.id)
          .all();

        if (existingCheck.results.length === 0) {
          throw new ValidationError(
            `Product with ID ${validatedInput.id} not found`,
          );
        }

        const { results } = await ctx.env.DB.prepare(
          `UPDATE products 
           SET name = ?, category = ?, price_cents = ?, description = ?, status = ?, updated_at = unixepoch()
           WHERE id = ? 
           RETURNING *`,
        )
          .bind(
            validatedInput.name,
            validatedInput.category,
            validatedInput.price_cents,
            validatedInput.description || null,
            validatedInput.status,
            validatedInput.id,
          )
          .all();

        if (results.length === 0) {
          throw new DatabaseError('Failed to update product');
        }

        const result = results[0];
        return productSchema.parse(result);
      } catch (error) {
        console.error('Update error:', error);
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new DatabaseError('Failed to update product');
      }
    }),

  delete: publicProcedure
    .input(deleteProductSchema)
    .output(z.object({ success: z.boolean(), id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate input
        const validatedInput = deleteProductSchema.parse(input);

        // Check if product exists
        const existingCheck = await ctx.env.DB.prepare(
          'SELECT id FROM products WHERE id = ? LIMIT 1',
        )
          .bind(validatedInput.id)
          .all();

        if (existingCheck.results.length === 0) {
          throw new ValidationError(
            `Product with ID ${validatedInput.id} not found`,
          );
        }

        // Soft delete by setting status to 0
        const { success } = await ctx.env.DB.prepare(
          'UPDATE products SET status = 0, updated_at = unixepoch() WHERE id = ?',
        )
          .bind(validatedInput.id)
          .run();

        if (!success) {
          throw new DatabaseError('Failed to delete product');
        }

        return { success: true, id: validatedInput.id };
      } catch (error) {
        console.error('Delete error:', error);
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new DatabaseError('Failed to delete product');
      }
    }),
});
