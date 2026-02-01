// Error classes
export {
  APIError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  HttpStatus,
  HttpStatusRange,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
} from './api-error'

export type { APIErrorResponse, ParsedError } from './api-error'

// Fetch error handling
export {
  handleFetchError,
  handleResponse,
  safeFetch,
  withAPIErrorHandling,
} from './error-handler'

// Axios error handling
export {
  handleAxiosError,
  requestInterceptor,
  responseErrorInterceptor,
  responseInterceptor,
} from './axios-error-handler'

// Response parsing
export { parseErrorResponse, parseFieldErrors } from './response-parser'

// Utilities
export {
  formatErrorForLogging,
  getErrorMessage,
  getRetryDelay,
  isAPIError,
  isAuthenticationError,
  isAuthorizationError,
  isConflictError,
  isNetworkError,
  isNotFoundError,
  isRateLimitError,
  isRetryableError,
  isServerError,
  isValidationError,
  shouldReauthenticate,
} from './error-utils'
