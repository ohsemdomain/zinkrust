import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../worker/trpc/app';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/trpc',
    }),
  ],
});
