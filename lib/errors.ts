/**
 * Standardized error handling utilities
 */

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function createErrorResponse(
  error: unknown,
  defaultMessage: string = 'An error occurred'
): { error: string; code?: string; details?: unknown } {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    // Don't expose internal error messages in production
    if (process.env.NODE_ENV === 'production') {
      return { error: defaultMessage };
    }
    return { error: error.message };
  }

  return { error: defaultMessage };
}

export function validateString(value: unknown, fieldName: string, minLength: number = 1): string {
  if (typeof value !== 'string') {
    throw new AppError(`${fieldName} must be a string`, 'VALIDATION_ERROR', 400);
  }
  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    throw new AppError(`${fieldName} must be at least ${minLength} character(s)`, 'VALIDATION_ERROR', 400);
  }
  return trimmed;
}

export function validateNumber(value: unknown, fieldName: string, min: number = 0): number {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new AppError(`${fieldName} must be a number`, 'VALIDATION_ERROR', 400);
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    throw new AppError(`${fieldName} must be a valid number`, 'VALIDATION_ERROR', 400);
  }
  if (num < min) {
    throw new AppError(`${fieldName} must be at least ${min}`, 'VALIDATION_ERROR', 400);
  }
  return num;
}

export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 10000); // Limit length
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new AppError('Invalid URL protocol', 'VALIDATION_ERROR', 400);
    }
    return parsed.toString();
  } catch {
    throw new AppError('Invalid URL format', 'VALIDATION_ERROR', 400);
  }
}
