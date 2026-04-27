import axios from 'axios'
import { useAuthStore, getMemoryToken } from '../stores/authStore'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // required for HttpOnly refresh token cookie
})

// Separate instance for the refresh call — bypasses the 401 interceptor to avoid loops
export const refreshClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

client.interceptors.request.use((config) => {
  const token = getMemoryToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const extractErrorMessage = (error: unknown): string => {
  const err = error as {
    response?: { data?: { message?: string; fieldErrors?: Record<string, string> } }
    message?: string
  }
  const data = err.response?.data
  if (data?.fieldErrors) {
    const first = Object.values(data.fieldErrors)[0]
    if (first) return first
  }
  return data?.message ?? err.message ?? 'Error inesperado'
}

let isRefreshing = false
let refreshQueue: ((token: string) => void)[] = []

const drainQueue = (token: string) => {
  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }
    const status = error.response?.status

    // Don't retry auth endpoints
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(client(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const { silentRefresh } = await import('./auth')
        const { token } = await silentRefresh()
        useAuthStore.getState().setToken(token)
        drainQueue(token)
        originalRequest.headers.Authorization = `Bearer ${token}`
        return client(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth'
        }
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    if (status === 403) {
      useAuthStore.getState().logout()
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth'
      }
    }

    error.displayMessage = extractErrorMessage(error)
    return Promise.reject(error)
  }
)

export default client
