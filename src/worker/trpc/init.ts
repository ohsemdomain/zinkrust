import { initTRPC } from '@trpc/server';
import type { CreateTRPCContext } from './types/context';

// Initialize tRPC with context
const t = initTRPC.context<CreateTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        code: error.code,
      },
    };
  },
});

// Export reusable pieces
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
