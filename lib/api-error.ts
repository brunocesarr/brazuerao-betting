/**
 * Centralized error handling for external API calls
 */

class APIError extends Error {
  constructor(
    public readonly source: string,
    public readonly originalError: unknown
  ) {
    const message =
      originalError instanceof Error
        ? originalError.message
        : String(originalError)
    super(`${source}: ${message}`)
    this.name = 'APIError'
  }
}

/**
 * Wraps API calls with consistent error handling and logging
 */
export async function withAPIErrorHandling<T>(
  fn: () => Promise<T>,
  source: string
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    console.error(`[${source}] API Error:`, error)
    throw new APIError(source, error)
  }
}

export { APIError }
