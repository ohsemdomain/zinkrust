// Re-export shared error utilities
export { createError, isAppError, extractErrorMessage, APP_ERROR_CODES } from '../../../shared/errors';
import { createError } from '../../../shared/errors';

// Convenience error creators for backward compatibility
export const DatabaseError = (message = 'Database operation failed') => 
  createError('DATABASE_ERROR', message);

export const ValidationError = (message = 'Invalid input data') => 
  createError('VALIDATION_ERROR', message);

export const NotFoundError = (resource = 'Resource') => 
  createError('NOT_FOUND', `${resource} not found`);
