import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../worker/trpc/app';
import { APP_CONFIG } from '../../shared/config';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: APP_CONFIG.api.endpoints.trpc,
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
