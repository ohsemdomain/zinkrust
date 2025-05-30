import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { queryClient } from '~/lib/query-client';
import { trpc, trpcClient } from '~/lib/trpc';
import { ErrorBoundary } from '../ui/ErrorBoundary';

interface TRPCProviderProps {
  children: ReactNode;
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  const [client] = useState(() => trpcClient);

  return (
    <ErrorBoundary>
      <trpc.Provider client={client} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}
