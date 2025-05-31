/// <reference types="@cloudflare/workers-types" />
import { TRPCError, initTRPC } from '@trpc/server';

// ==================== TYPES ====================
export interface Env {
  zinkrust_kv: KVNamespace;
  zinkrust_r2: R2Bucket;
  DB: D1Database;
}

// ==================== TRPC SETUP ====================
export const t = initTRPC.context<{ env: Env }>().create();

// ==================== ERROR HELPERS ====================
export const DatabaseError = (message = 'Database operation failed') =>
  new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });

export const ValidationError = (message = 'Invalid input data') =>
  new TRPCError({ code: 'BAD_REQUEST', message });

// ==================== TABLE WHITELIST ====================
const ALLOWED_TABLES = ['products', 'customers', 'contacts'] as const;
type AllowedTable = (typeof ALLOWED_TABLES)[number];

// ==================== UTILITIES ====================
export async function generateUniqueId(
  db: D1Database,
  table: AllowedTable,
  minId: number,
  maxId: number,
  maxAttempts = 10,
): Promise<number> {
  // Validate table name against whitelist
  if (!ALLOWED_TABLES.includes(table)) {
    throw ValidationError(`Invalid table name: ${table}`);
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const randomId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;

    const existingCheck = await db
      .prepare(`SELECT id FROM ${table} WHERE id = ? LIMIT 1`)
      .bind(randomId)
      .all();

    if (existingCheck.results.length === 0) {
      return randomId;
    }
  }

  throw DatabaseError(
    `Failed to generate unique ID for ${table} after ${maxAttempts} attempts`,
  );
}
