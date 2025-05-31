/// <reference types="@cloudflare/workers-types" />
import { trpcServer } from '@hono/trpc-server';
import { TRPCError, initTRPC } from '@trpc/server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import {
  APP_CONFIG,
  type Product,
  createProductSchema,
  productFilterSchema,
  updateProductSchema,
} from './shared';

// ==================== TYPES ====================
interface Env {
  zinkrust_kv: KVNamespace;
  zinkrust_r2: R2Bucket;
  DB: D1Database;
}

// ==================== TRPC SETUP ====================
const t = initTRPC.context<{ env: Env }>().create();

// ==================== ERROR HELPERS ====================
const DatabaseError = (message = 'Database operation failed') =>
  new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });

const ValidationError = (message = 'Invalid input data') =>
  new TRPCError({ code: 'BAD_REQUEST', message });

// ==================== UTILITIES ====================
async function generateUniqueProductId(db: D1Database): Promise<number> {
  const minId = 100000000; // 9-digit minimum
  const maxId = 999999999; // 9-digit maximum
  const maxAttempts = APP_CONFIG.products.idGenerationMaxAttempts;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;

    const existingCheck = await db
      .prepare('SELECT id FROM products WHERE id = ? LIMIT 1')
      .bind(randomId)
      .all();

    if (existingCheck.results.length === 0) {
      return randomId;
    }
  }

  throw DatabaseError(
    'Failed to generate unique product ID after maximum attempts',
  );
}

// ==================== SCHEMAS ====================
const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.number(),
  price_cents: z.number().int().positive(),
  description: z.string().nullable(),
  status: z.number(),
  created_at: z.number(),
  updated_at: z.number(),
});

const deleteProductSchema = z.object({
  id: z.number().positive(),
});

// ==================== ROUTER ====================
const appRouter = t.router({
  products: t.router({
    getAll: t.procedure
      .input(productFilterSchema.optional())
      .output(
        z.object({
          products: z.array(z.custom<Product>()),
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
          const allowedColumns = [
            'name',
            'category',
            'status',
            'created_at',
            'updated_at',
          ];
          const validSortColumn = allowedColumns.includes(sort_column)
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

          // Validate each result against the schema
          const validatedResults = results.map((result: unknown) => {
            try {
              return productSchema.parse(result);
            } catch (error) {
              console.error(
                'Product validation error:',
                error,
                'Data:',
                result,
              );
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

          return results[0] as unknown as Product;
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
          const productId = await generateUniqueProductId(ctx.env.DB);

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

          return results[0] as unknown as Product;
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

          return results[0] as unknown as Product;
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
          if (error instanceof TRPCError) {
            throw error;
          }
          throw DatabaseError('Failed to delete product');
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

// ==================== HONO APP ====================
const app = new Hono<{ Bindings: Env }>();

// Enable CORS
app.use('*', cors());

// Health check endpoint
app.get('/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() }),
);

// Optional: Keep the original API endpoint for backward compatibility
app.get('/api/', (c) => c.json({ name: 'Cloudflare' }));

// Mount TRPC
app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) => ({ env: c.env }),
  }),
);

export default app;
