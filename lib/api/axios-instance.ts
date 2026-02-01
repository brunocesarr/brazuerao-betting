import {
  requestInterceptor,
  responseErrorInterceptor,
  responseInterceptor,
} from '@/lib/errors/axios-error-handler'
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

// ============================================================================
// AXIOS INSTANCE CONFIGURATION
// ============================================================================

/**
 * Default axios configuration
 */
const defaultConfig: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => {
    // Don't throw for any status - we'll handle errors ourselves
    return status >= 200 && status < 600
  },
}

/**
 * Create axios instance
 */
export const apiClient: AxiosInstance = axios.create(defaultConfig)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a new axios instance with custom config
 */
export function createApiClient(config?: AxiosRequestConfig): AxiosInstance {
  const instance = axios.create({
    ...defaultConfig,
    ...config,
  })

  // Apply same interceptors
  instance.interceptors.request.use(requestInterceptor)
  instance.interceptors.response.use(
    responseInterceptor,
    responseErrorInterceptor
  )

  return instance
}

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || '/api'
}
