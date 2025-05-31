export const APP_CONFIG = {
  api: {
    endpoints: {
      trpc: '/trpc',
      api: '/api/',
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
  },
} as const;

export type AppConfig = typeof APP_CONFIG;