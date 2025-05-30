import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../worker/trpc/app';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/trpc',
      headers() {
        return {
          'Content-Type': 'application/json',
        };
      },
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          credentials: 'same-origin',
        });
      },
    }),
  ],
});
