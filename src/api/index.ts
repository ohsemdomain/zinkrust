/// <reference types="@cloudflare/workers-types" />
import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { APP_CONFIG } from '../shared';
import { productsRouter } from './routers/products';
import { type Env, t } from './trpc';

// ==================== MAIN APP ROUTER ====================
const appRouter = t.router({
  products: productsRouter,
});

export type AppRouter = typeof appRouter;

// ==================== HONO APP ====================
const app = new Hono<{ Bindings: Env }>();

// Enable CORS with configuration
app.use(
  '*',
  cors({
    origin: APP_CONFIG.api.cors.origin,
    credentials: APP_CONFIG.api.cors.credentials,
  }),
);

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
