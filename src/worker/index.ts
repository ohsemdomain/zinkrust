import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { appRouter } from './trpc/app';

const app = new Hono<{ Bindings: Env }>();

// Keep the original API endpoint for compatibility
app.get('/api/', (c) => c.json({ name: 'Cloudflare' }));

// Add tRPC endpoint
app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) => {
      return {
        env: c.env,
      };
    },
  }),
);

export default app;
