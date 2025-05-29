import { createTRPCRouter } from './init';
import { productsRouter } from './routers/products';

export const appRouter = createTRPCRouter({
  products: productsRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
