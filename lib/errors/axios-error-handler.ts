import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
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
  type APIErrorResponse,
} from './api-error'

// ============================================================================
// AXIOS ERROR HANDLING
// ============================================================================

/**
 * Parse error message from axios error response
 */
function parseAxiosErrorMessage(error: AxiosError<APIErrorResponse>): string {
  const data = error.response?.data

  if (!data) {
    return getDefaultErrorMessage(error.response?.status || 500)
  }

  // Priority: error > message > errors (array) > errors (object)
  if (data.error) {
    return String(data.error)
  }

  if (data.message) {
    return String(data.message)
  }

  if (data.errors) {
    if (Array.isArray(data.errors)) {
      return data.errors.join(', ')
    }

    if (typeof data.errors === 'object') {
      const messages = Object.values(data.errors).flat().join(', ')
      return messages || getDefaultErrorMessage(error.response?.status || 500)
    }
  }

  return getDefaultErrorMessage(error.response?.status || 500)
}

/**
 * Parse field validation errors from axios error response
 */
function parseAxiosFieldErrors(
  error: AxiosError<APIErrorResponse>
): Record<string, string[]> | undefined {
  const data = error.response?.data

  if (
    !data?.errors ||
    typeof data.errors !== 'object' ||
    Array.isArray(data.errors)
  ) {
    return undefined
  }

  return data.errors as Record<string, string[]>
}

/**
 * Get default error message based on status code
 */
function getDefaultErrorMessage(statusCode: number): string {
  const messages: Record<number, string> = {
    400: 'Requisição inválida.',
    401: 'Não autenticado. Faça login novamente.',
    403: 'Acesso negado.',
    404: 'Recurso não encontrado.',
    409: 'Conflito ao processar a solicitação.',
    422: 'Dados inválidos.',
    429: 'Muitas solicitações. Tente novamente mais tarde.',
    500: 'Erro interno do servidor.',
    502: 'Servidor temporariamente indisponível.',
    503: 'Serviço temporariamente indisponível.',
    504: 'Tempo de resposta do servidor esgotado.',
  }

  return messages[statusCode] || 'Erro desconhecido.'
}

/**
 * Convert axios error to custom API error
 */
export function handleAxiosError(error: unknown, source: string): never {
  // Not an axios error - treat as network error
  if (!axios.isAxiosError(error)) {
    if (error instanceof APIError) {
      throw error
    }

    const message =
      error instanceof Error
        ? error.message
        : 'Erro inesperado ao processar a solicitação.'

    throw new APIError(source, message, { details: error })
  }

  const axiosError = error as AxiosError<APIErrorResponse>

  // Network error (no response received)
  if (!axiosError.response) {
    if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
      throw new NetworkError(source, 'Tempo de conexão esgotado.')
    }

    throw new NetworkError(source, axiosError)
  }

  // Parse error details
  const message = parseAxiosErrorMessage(axiosError)
  const fieldErrors = parseAxiosFieldErrors(axiosError)
  const statusCode = axiosError.response.status

  // Throw specific error based on status code
  switch (statusCode) {
    case HttpStatus.BAD_REQUEST:
    case HttpStatus.UNPROCESSABLE_ENTITY:
      throw new ValidationError(source, message, {
        statusCode,
        fieldErrors,
        details: axiosError.response.data,
      })

    case HttpStatus.UNAUTHORIZED:
      throw new AuthenticationError(source, message)

    case HttpStatus.FORBIDDEN:
      throw new AuthorizationError(source, message)

    case HttpStatus.NOT_FOUND:
      throw new NotFoundError(source, message)

    case HttpStatus.CONFLICT:
      throw new ConflictError(source, message)

    case HttpStatus.TOO_MANY_REQUESTS: {
      const retryAfter = axiosError.response.headers['retry-after']
      const retrySeconds = retryAfter ? parseInt(retryAfter) : undefined
      throw new RateLimitError(source, retrySeconds)
    }

    default:
      // Server errors (5xx) or other client errors (4xx)
      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        throw new ServerError(source, statusCode, message)
      }

      // Generic API error
      throw new APIError(source, message, {
        statusCode,
        statusText: axiosError.response.statusText,
        details: axiosError.response.data,
      })
  }
}

/**
 * Response interceptor for error handling
 */
export function responseErrorInterceptor(error: unknown) {
  // For interceptors, we don't have a source context
  // So we'll use a generic source or let the caller handle it
  return Promise.reject(error)
}

/**
 * Request interceptor for logging (optional)
 */
export function requestInterceptor(config: InternalAxiosRequestConfig) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url}`)
  }
  return config
}

/**
 * Response interceptor for logging (optional)
 */
export function responseInterceptor(response: AxiosResponse) {
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[Axios] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`
    )
  }
  return response
}
