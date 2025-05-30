import { QueryClient } from '@tanstack/react-query';
import { CACHE_CONFIG, RETRY_CONFIG } from './query-config';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_CONFIG.STALE_TIME.MEDIUM,
      gcTime: CACHE_CONFIG.CACHE_TIME.MEDIUM,
      retry: (failureCount, error: unknown) => {
        const errorData = error as { data?: { httpStatus?: number } };
        if (errorData?.data?.httpStatus === 404) return false;
        if (errorData?.data?.httpStatus === 401) return false;
        if (errorData?.data?.httpStatus === 403) return false;
        return failureCount < RETRY_CONFIG.MAX_RETRIES;
      },
      retryDelay: RETRY_CONFIG.RETRY_DELAY,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      networkMode: 'online',
    },
    mutations: {
      retry: (failureCount, error: unknown) => {
        const errorData = error as { data?: { httpStatus?: number } };
        if (
          errorData?.data?.httpStatus &&
          errorData.data.httpStatus >= 400 &&
          errorData.data.httpStatus < 500
        )
          return false;
        return failureCount < RETRY_CONFIG.MUTATION_RETRIES;
      },
      retryDelay: RETRY_CONFIG.MUTATION_RETRY_DELAY,
      networkMode: 'online',
    },
  },
});
