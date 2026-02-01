import { createApiClient } from '@/lib/api'
import { AxiosRequestConfig } from 'axios'

// ============================================================================
// AXIOS INSTANCE CONFIGURATION
// ============================================================================

const URL_BASE_API_BRAZUERAO = process.env.NEXT_PUBLIC_URL_BASE_API_BRAZUERAO
const URL_BASE_APP_BRAZUERAO = process.env.NEXT_PUBLIC_URL_BASE_APP_BRAZUERAO

/**
 * Default configuration for Axios instances
 */
const createDefaultConfig = (baseURL: string): AxiosRequestConfig => ({
  baseURL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => {
    // Don't throw for any status - we'll handle errors ourselves
    return status >= 200 && status < 600
  },
})

/**
 * Brazuerao API client - for raw API calls
 */
const apiBrazuerao = createApiClient(
  createDefaultConfig(URL_BASE_API_BRAZUERAO ?? '')
)

/**
 * Brazuerao App client - for authenticated app endpoints
 */
const appBrazuerao = createApiClient(
  createDefaultConfig(URL_BASE_APP_BRAZUERAO ?? '')
)

// ============================================================================
// REQUEST INTERCEPTORS
// ============================================================================

/**
 * Request interceptor: Log requests in development
 */
apiBrazuerao.interceptors.request.use(
  async (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error('[API] Request error:', error)
    return Promise.reject(error)
  }
)

appBrazuerao.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[APP] ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error('[APP] Request error:', error)
    return Promise.reject(error)
  }
)

export { apiBrazuerao, appBrazuerao }
