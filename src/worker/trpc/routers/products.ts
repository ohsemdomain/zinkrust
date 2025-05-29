import { z } from 'zod';
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
    .output(z.array(productSchema))
    .query(async ({ ctx }) => {
      try {
        const { results } = await ctx.env.DB.prepare(
          'SELECT * FROM products WHERE status = 1 ORDER BY created_at DESC',
        ).all();

        // Validate each result against the schema
        const validatedResults = results.map((result: unknown) => {
          try {
            return productSchema.parse(result);
          } catch (error) {
            console.error('Product validation error:', error, 'Data:', result);
            throw new ValidationError('Invalid product data from database');
          }
        });

        return validatedResults;
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
          'SELECT * FROM products WHERE id = ? AND status = 1',
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
          `INSERT INTO products (id, name, category, price, description, status) 
           VALUES (?, ?, ?, ?, ?, ?) 
           RETURNING *`,
        )
          .bind(
            productId,
            validatedInput.name,
            validatedInput.category,
            validatedInput.price,
            validatedInput.description || null,
            validatedInput.status || 1,
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
           SET name = ?, category = ?, price = ?, description = ?, status = ?, updated_at = unixepoch()
           WHERE id = ? 
           RETURNING *`,
        )
          .bind(
            validatedInput.name,
            validatedInput.category,
            validatedInput.price,
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

        const { success } = await ctx.env.DB.prepare(
          'DELETE FROM products WHERE id = ?',
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
