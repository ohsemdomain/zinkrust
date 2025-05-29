import { TRPCError } from '@trpc/server';

export class DatabaseError extends TRPCError {
  constructor(message = 'Database operation failed') {
    super({
      code: 'INTERNAL_SERVER_ERROR',
      message,
    });
  }
}

export class ValidationError extends TRPCError {
  constructor(message = 'Invalid input data') {
    super({
      code: 'BAD_REQUEST',
      message,
    });
  }
}

export class NotFoundError extends TRPCError {
  constructor(resource = 'Resource') {
    super({
      code: 'NOT_FOUND',
      message: `${resource} not found`,
    });
  }
}
