// ==================== APPLICATION CONFIG ====================
export const APP_CONFIG = {
  api: {
    endpoints: {
      trpc: import.meta.env.VITE_API_URL || '/trpc',
    },
    timeout: 30000,
    retries: 3,
  },
  pagination: {
    defaultPageSize: 25,
    maxPageSize: 100,
  },
  ui: {
    notifications: {
      autoHideDelay: 5000,
    },
  },
  products: {
    idGenerationMaxAttempts: 10,
    priceDecimalPlaces: 2,
    minId: 100000000, // 9-digit minimum
    maxId: 999999999, // 9-digit maximum
  },
} as const;