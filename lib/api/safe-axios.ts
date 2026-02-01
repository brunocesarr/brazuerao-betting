import { handleAxiosError } from '@/lib/errors/axios-error-handler'
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// ============================================================================
// SAFE AXIOS WRAPPERS
// ============================================================================

/**
 * Safe axios request wrapper with error handling
 */
export async function safeAxios<T = any>(
  apiClient: AxiosInstance,
  config: AxiosRequestConfig,
  source: string = 'API'
): Promise<AxiosResponse<T>> {
  try {
    const response = await apiClient.request<T>(config)

    // Axios doesn't throw for non-2xx by default with our config
    // So we need to check status manually
    if (response.status < 200 || response.status >= 300) {
      // Create a fake error for our handler
      const error = new Error('Request failed')
      ;(error as any).response = response
      ;(error as any).isAxiosError = true
      handleAxiosError(error, source)
    }

    return response
  } catch (error) {
    handleAxiosError(error, source)
  }
}

/**
 * Safe GET request
 */
export async function safeGet<T = any>(
  apiClient: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig,
  source: string = 'GET'
): Promise<AxiosResponse<T>> {
  return safeAxios<T>(
    apiClient,
    {
      method: 'GET',
      url,
      ...config,
    },
    source
  )
}

/**
 * Safe POST request
 */
export async function safePost<T = any>(
  apiClient: AxiosInstance,
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
  source: string = 'POST'
): Promise<AxiosResponse<T>> {
  return safeAxios<T>(
    apiClient,
    {
      method: 'POST',
      url,
      data,
      ...config,
    },
    source
  )
}

/**
 * Safe PUT request
 */
export async function safePut<T = any>(
  apiClient: AxiosInstance,
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
  source: string = 'PUT'
): Promise<AxiosResponse<T>> {
  return safeAxios<T>(
    apiClient,
    {
      method: 'PUT',
      url,
      data,
      ...config,
    },
    source
  )
}

/**
 * Safe PATCH request
 */
export async function safePatch<T = any>(
  apiClient: AxiosInstance,
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
  source: string = 'PATCH'
): Promise<AxiosResponse<T>> {
  return safeAxios<T>(
    apiClient,
    {
      method: 'PATCH',
      url,
      data,
      ...config,
    },
    source
  )
}

/**
 * Safe DELETE request
 */
export async function safeDelete<T = any>(
  apiClient: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig,
  source: string = 'DELETE'
): Promise<AxiosResponse<T>> {
  return safeAxios<T>(
    apiClient,
    {
      method: 'DELETE',
      url,
      ...config,
    },
    source
  )
}

/**
 * Alternative: Extract data directly (more convenient)
 */
export async function fetchData<T = any>(
  apiClient: AxiosInstance,
  config: AxiosRequestConfig,
  source: string = 'API'
): Promise<T> {
  const response = await safeAxios<T>(apiClient, config, source)
  return response.data
}

/**
 * Convenience methods that return data directly
 */
export const api = {
  get: async <T = any>(
    apiClient: AxiosInstance,
    url: string,
    config?: AxiosRequestConfig,
    source?: string
  ): Promise<T> => {
    const response = await safeGet<T>(apiClient, url, config, source)
    return response.data
  },

  post: async <T = any>(
    apiClient: AxiosInstance,
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    source?: string
  ): Promise<T> => {
    const response = await safePost<T>(apiClient, url, data, config, source)
    return response.data
  },

  put: async <T = any>(
    apiClient: AxiosInstance,
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    source?: string
  ): Promise<T> => {
    const response = await safePut<T>(apiClient, url, data, config, source)
    return response.data
  },

  patch: async <T = any>(
    apiClient: AxiosInstance,
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    source?: string
  ): Promise<T> => {
    const response = await safePatch<T>(apiClient, url, data, config, source)
    return response.data
  },

  delete: async <T = any>(
    apiClient: AxiosInstance,
    url: string,
    config?: AxiosRequestConfig,
    source?: string
  ): Promise<T> => {
    const response = await safeDelete<T>(apiClient, url, config, source)
    return response.data
  },
}
