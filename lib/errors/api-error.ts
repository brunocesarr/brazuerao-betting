// ============================================================================
// ERROR TYPES & INTERFACES
// ============================================================================

/**
 * HTTP status code ranges
 */
export enum HttpStatusRange {
  SUCCESS = 200,
  REDIRECT = 300,
  CLIENT_ERROR = 400,
  SERVER_ERROR = 500,
}

/**
 * Common HTTP status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * API error response formats
 */
export interface APIErrorResponse {
  error?: string
  message?: string
  errors?: Record<string, string[]> | string[]
  details?: unknown
}

/**
 * Parsed error information
 */
export interface ParsedError {
  message: string
  statusCode?: number
  statusText?: string
  details?: unknown
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Base API Error class
 */
export class APIError extends Error {
  public readonly name: string = 'APIError' // Changed from literal type
  public readonly source: string
  public readonly statusCode?: number
  public readonly statusText?: string
  public readonly details?: unknown
  public readonly timestamp: string

  constructor(
    source: string,
    message: string,
    options?: {
      statusCode?: number
      statusText?: string
      details?: unknown
      cause?: unknown
    }
  ) {
    super(message)
    this.source = source
    this.statusCode = options?.statusCode
    this.statusText = options?.statusText
    this.details = options?.details
    this.timestamp = new Date().toISOString()

    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, new.target.prototype)

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    return this.message
  }

  /**
   * Check if error is from client (4xx)
   */
  isClientError(): boolean {
    return (
      this.statusCode !== undefined &&
      this.statusCode >= HttpStatusRange.CLIENT_ERROR &&
      this.statusCode < HttpStatusRange.SERVER_ERROR
    )
  }

  /**
   * Check if error is from server (5xx)
   */
  isServerError(): boolean {
    return (
      this.statusCode !== undefined &&
      this.statusCode >= HttpStatusRange.SERVER_ERROR
    )
  }

  /**
   * Convert to plain object for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      source: this.source,
      statusCode: this.statusCode,
      statusText: this.statusText,
      details: this.details,
      timestamp: this.timestamp,
    }
  }
}

/**
 * Network-related errors (no response received)
 */
export class NetworkError extends APIError {
  public readonly name: string = 'NetworkError'

  constructor(source: string, originalError: unknown) {
    const message = 'Erro de conexão. Verifique sua internet e tente novamente.'
    super(source, message, {
      details: originalError,
    })
    Object.setPrototypeOf(this, NetworkError.prototype)
  }
}

/**
 * Validation errors (400, 422)
 */
export class ValidationError extends APIError {
  public readonly name: string = 'ValidationError'
  public readonly fieldErrors?: Record<string, string[]>

  constructor(
    source: string,
    message: string,
    options?: {
      statusCode?: number
      fieldErrors?: Record<string, string[]>
      details?: unknown
    }
  ) {
    super(source, message, {
      statusCode: options?.statusCode || HttpStatus.BAD_REQUEST,
      details: options?.details,
    })
    this.fieldErrors = options?.fieldErrors
    Object.setPrototypeOf(this, ValidationError.prototype)
  }

  /**
   * Get errors for a specific field
   */
  getFieldErrors(field: string): string[] | undefined {
    return this.fieldErrors?.[field]
  }

  /**
   * Get all field error messages as a single string
   */
  getAllFieldErrors(): string {
    if (!this.fieldErrors) return this.message

    const errors = Object.entries(this.fieldErrors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('; ')

    return errors || this.message
  }
}

/**
 * Authentication errors (401)
 */
export class AuthenticationError extends APIError {
  public readonly name: string = 'AuthenticationError'

  constructor(source: string, message?: string) {
    super(source, message || 'Sessão expirada. Faça login novamente.', {
      statusCode: HttpStatus.UNAUTHORIZED,
    })
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

/**
 * Authorization errors (403)
 */
export class AuthorizationError extends APIError {
  public readonly name: string = 'AuthorizationError'

  constructor(source: string, message?: string) {
    super(
      source,
      message || 'Você não tem permissão para acessar este recurso.',
      {
        statusCode: HttpStatus.FORBIDDEN,
      }
    )
    Object.setPrototypeOf(this, AuthorizationError.prototype)
  }
}

/**
 * Not found errors (404)
 */
export class NotFoundError extends APIError {
  public readonly name: string = 'NotFoundError'

  constructor(source: string, message?: string, resourceType?: string) {
    super(source, message || `${resourceType || 'Recurso'} não encontrado.`, {
      statusCode: HttpStatus.NOT_FOUND,
    })
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * Conflict errors (409)
 */
export class ConflictError extends APIError {
  public readonly name: string = 'ConflictError'

  constructor(source: string, message?: string) {
    super(source, message || 'Conflito ao processar a solicitação.', {
      statusCode: HttpStatus.CONFLICT,
    })
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

/**
 * Rate limit errors (429)
 */
export class RateLimitError extends APIError {
  public readonly name: string = 'RateLimitError'

  constructor(source: string, retryAfter?: number) {
    const message = retryAfter
      ? `Muitas solicitações. Tente novamente em ${retryAfter} segundos.`
      : 'Muitas solicitações. Tente novamente mais tarde.'

    super(source, message, {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      details: { retryAfter },
    })
    Object.setPrototypeOf(this, RateLimitError.prototype)
  }
}

/**
 * Server errors (5xx)
 */
export class ServerError extends APIError {
  public readonly name: string = 'ServerError'

  constructor(source: string, statusCode?: number, message?: string) {
    super(source, message || 'Erro no servidor. Tente novamente mais tarde.', {
      statusCode: statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
    })
    Object.setPrototypeOf(this, ServerError.prototype)
  }
}
