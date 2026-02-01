import {
  APIError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
} from './api-error'

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if error is an API error
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

/**
 * Check if error is an authentication error
 */
export function isAuthenticationError(
  error: unknown
): error is AuthenticationError {
  return error instanceof AuthenticationError
}

/**
 * Check if error is an authorization error
 */
export function isAuthorizationError(
  error: unknown
): error is AuthorizationError {
  return error instanceof AuthorizationError
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError
}

/**
 * Check if error is a conflict error
 */
export function isConflictError(error: unknown): error is ConflictError {
  return error instanceof ConflictError
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError
}

/**
 * Check if error is a server error
 */
export function isServerError(error: unknown): error is ServerError {
  return error instanceof ServerError
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Get user-friendly error message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.getUserMessage()
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocorreu um erro inesperado.'
}

/**
 * Check if error should trigger re-authentication
 */
export function shouldReauthenticate(error: unknown): boolean {
  return isAPIError(error) && error.name === 'AuthenticationError'
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (!isAPIError(error)) {
    return false
  }

  // Retry network errors and some server errors
  return (
    error.name === 'NetworkError' ||
    error.name === 'RateLimitError' ||
    (error.isServerError() && error.statusCode !== 501) // Don't retry Not Implemented
  )
}

/**
 * Get retry delay from error (useful for rate limiting)
 */
export function getRetryDelay(error: unknown): number | null {
  if (!isAPIError(error)) {
    return null
  }

  if (error.name === 'RateLimitError' && error.details) {
    const retryAfter = (error.details as any).retryAfter
    return retryAfter ? retryAfter * 1000 : 60000 // Default 60s
  }

  if (error.name === 'NetworkError') {
    return 5000 // 5 seconds for network errors
  }

  return null
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: unknown): Record<string, any> {
  if (error instanceof APIError) {
    return error.toJSON()
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return {
    error: String(error),
  }
}
