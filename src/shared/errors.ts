import { TRPCError } from '@trpc/server';

export const APP_ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type AppErrorCode = keyof typeof APP_ERROR_CODES;

export function createError(code: AppErrorCode, message: string, cause?: unknown) {
  const trpcCode = code === 'NOT_FOUND' ? 'NOT_FOUND' :
                   code === 'VALIDATION_ERROR' ? 'BAD_REQUEST' :
                   code === 'DATABASE_ERROR' ? 'INTERNAL_SERVER_ERROR' :
                   code === 'UNAUTHORIZED' ? 'UNAUTHORIZED' :
                   code === 'FORBIDDEN' ? 'FORBIDDEN' :
                   'INTERNAL_SERVER_ERROR';

  return new TRPCError({
    code: trpcCode,
    message,
    cause,
  });
}

export function isAppError(error: unknown): error is TRPCError {
  return error instanceof TRPCError;
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}