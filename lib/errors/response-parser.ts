import type { APIErrorResponse, ParsedError } from './api-error'

// ============================================================================
// RESPONSE PARSING
// ============================================================================

/**
 * Parse error response body
 */
export async function parseErrorResponse(
  response: Response
): Promise<ParsedError> {
  const contentType = response.headers.get('content-type')
  let errorData: APIErrorResponse | null = null

  try {
    // Try to parse JSON response
    if (contentType?.includes('application/json')) {
      errorData = await response.json()
    } else {
      // Try text for other content types
      const text = await response.text()
      if (text) {
        // Try to parse as JSON anyway (some APIs don't set correct content-type)
        try {
          errorData = JSON.parse(text)
        } catch {
          // If not JSON, use text as error message
          return {
            message: text,
            statusCode: response.status,
            statusText: response.statusText,
          }
        }
      }
    }
  } catch (parseError) {
    console.warn(
      '[Response Parser] Failed to parse error response:',
      parseError
    )
  }

  // Extract message from error data
  const message = extractErrorMessage(errorData, response)

  return {
    message,
    statusCode: response.status,
    statusText: response.statusText,
    details: errorData,
  }
}

/**
 * Extract error message from various response formats
 */
function extractErrorMessage(
  errorData: APIErrorResponse | null,
  response: Response
): string {
  if (!errorData) {
    return getDefaultErrorMessage(response.status)
  }

  // Priority order for extracting message:
  // 1. error field (common in many APIs)
  // 2. message field
  // 3. errors array (join multiple errors)
  // 4. errors object (join field errors)
  // 5. default message based on status code

  if (errorData.error) {
    return String(errorData.error)
  }

  if (errorData.message) {
    return String(errorData.message)
  }

  if (errorData.errors) {
    if (Array.isArray(errorData.errors)) {
      return errorData.errors.join(', ')
    }

    if (typeof errorData.errors === 'object') {
      const messages = Object.values(errorData.errors).flat().join(', ')
      return messages || getDefaultErrorMessage(response.status)
    }
  }

  return getDefaultErrorMessage(response.status)
}

/**
 * Get default error message based on HTTP status code
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
 * Parse field validation errors from response
 */
export function parseFieldErrors(
  errorData: APIErrorResponse | null
): Record<string, string[]> | undefined {
  if (!errorData?.errors || typeof errorData.errors !== 'object') {
    return undefined
  }

  if (Array.isArray(errorData.errors)) {
    return undefined
  }

  return errorData.errors as Record<string, string[]>
}
