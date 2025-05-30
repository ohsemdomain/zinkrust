export const QUERY_KEYS = {
  PRODUCTS: {
    ALL: ['products'] as const,
    DETAIL: (id: number) => ['products', 'detail', id] as const,
  },
} as const;

export const CACHE_CONFIG = {
  STALE_TIME: {
    SHORT: 30 * 1000, // 30 seconds
    MEDIUM: 5 * 60 * 1000, // 5 minutes
    LONG: 30 * 60 * 1000, // 30 minutes
  },
  CACHE_TIME: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 10 * 60 * 1000, // 10 minutes
    LONG: 60 * 60 * 1000, // 1 hour
  },
} as const;

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  MUTATION_RETRIES: 2,
  MUTATION_RETRY_DELAY: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
} as const;