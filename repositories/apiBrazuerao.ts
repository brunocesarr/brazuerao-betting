import axios, { AxiosRequestConfig } from 'axios'

const URL_BASE_API_BRAZUERAO = process.env.NEXT_PUBLIC_URL_BASE_API_BRAZUERAO

const URL_BASE_APP_BRAZUERAO = process.env.NEXT_PUBLIC_URL_BASE_APP_BRAZUERAO

const apiBrazueraoDefaultOptions: AxiosRequestConfig = {
  baseURL: URL_BASE_API_BRAZUERAO,
  headers: {
    'Content-Type': 'application/json',
  },
}

const appBrazueraoDefaultOptions: AxiosRequestConfig = {
  baseURL: URL_BASE_APP_BRAZUERAO,
  headers: {
    'Content-Type': 'application/json',
  },
}

const apiBrazuerao = axios.create(apiBrazueraoDefaultOptions)
const appBrazuerao = axios.create(appBrazueraoDefaultOptions)

export { apiBrazuerao, appBrazuerao }
