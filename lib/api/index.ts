// Axios instance
export { apiClient, createApiClient, getApiBaseUrl } from './axios-instance'

// Safe wrappers
export {
  api,
  fetchData,
  safeAxios,
  safeDelete,
  safeGet,
  safePatch,
  safePost,
  safePut,
} from '@/lib/api/safe-axios'
