import {
  APIError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  HttpStatus,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
} from './api-error'
import { parseErrorResponse, parseFieldErrors } from './response-parser'

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handle fetch response and throw appropriate error if not ok
 */
export async function handleResponse(
  response: Response,
  source: string
): Promise<Response> {
  if (response.ok) {
    return response
  }

  // Parse error details from response
  const parsedError = await parseErrorResponse(response)
  const fieldErrors = parseFieldErrors(parsedError.details as any)

  // Throw specific error based on status code
  switch (response.status) {
    case HttpStatus.BAD_REQUEST:
    case HttpStatus.UNPROCESSABLE_ENTITY:
      throw new ValidationError(source, parsedError.message, {
        statusCode: response.status,
        fieldErrors,
        details: parsedError.details,
      })

    case HttpStatus.UNAUTHORIZED:
      throw new AuthenticationError(source, parsedError.message)

    case HttpStatus.FORBIDDEN:
      throw new AuthorizationError(source, parsedError.message)

    case HttpStatus.NOT_FOUND:
      throw new NotFoundError(source, parsedError.message)

    case HttpStatus.CONFLICT:
      throw new ConflictError(source, parsedError.message)

    case HttpStatus.TOO_MANY_REQUESTS:
      const retryAfter = response.headers.get('Retry-After')
      throw new RateLimitError(
        source,
        retryAfter ? parseInt(retryAfter) : undefined
      )

    default:
      // Server errors (5xx) or other client errors (4xx)
      if (response.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ServerError(source, response.status, parsedError.message)
      }

      // Generic API error for other status codes
      throw new APIError(source, parsedError.message, {
        statusCode: response.status,
        statusText: response.statusText,
        details: parsedError.details,
      })
  }
}

/**
 * Handle network or other errors during fetch
 */
export function handleFetchError(error: unknown, source: string): never {
  // If it's already our custom error, re-throw it
  if (error instanceof APIError) {
    throw error
  }

  // Network errors (TypeError is thrown by fetch for network issues)
  if (error instanceof TypeError) {
    throw new NetworkError(source, error)
  }

  // Generic error
  const message =
    error instanceof Error
      ? error.message
      : 'Erro inesperado ao processar a solicitação.'

  throw new APIError(source, message, {
    details: error,
  })
}

/**
 * Wrapper for API calls with consistent error handling
 */
export async function withAPIErrorHandling<T>(
  fn: () => Promise<T>,
  source: string
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    // Log error for debugging
    console.error(`[${source}] API Error:`, error)

    // Re-throw if already handled
    if (error instanceof APIError) {
      throw error
    }

    // Handle unexpected errors
    handleFetchError(error, source)
  }
}

/**
 * Safe fetch wrapper with error handling
 */
export async function safeFetch(
  url: string,
  options: RequestInit = {},
  source: string = 'API'
): Promise<Response> {
  try {
    const response = await fetch(url, options)
    return await handleResponse(response, source)
  } catch (error) {
    handleFetchError(error, source)
  }
}
