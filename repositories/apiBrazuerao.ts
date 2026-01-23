import axios, { AxiosRequestConfig } from 'axios'

const URL_BASE_API_BRAZUERAO = process.env.NEXT_PUBLIC_URL_BASE_API_BRAZUERAO
const URL_BASE_APP_BRAZUERAO = process.env.NEXT_PUBLIC_URL_BASE_APP_BRAZUERAO

/**
 * Default configuration for Axios instances
 */
const createDefaultConfig = (baseURL: string): AxiosRequestConfig => ({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Brazuerao API client - for raw API calls
 */
const apiBrazuerao = axios.create(
  createDefaultConfig(URL_BASE_API_BRAZUERAO ?? '')
)

/**
 * Brazuerao App client - for authenticated app endpoints
 */
const appBrazuerao = axios.create(
  createDefaultConfig(URL_BASE_APP_BRAZUERAO ?? '')
)

/**
 * Request interceptor: Log requests in development
 */
apiBrazuerao.interceptors.request.use(
  (config) => {
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
