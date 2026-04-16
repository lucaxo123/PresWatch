import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const extractErrorMessage = (error: unknown): string => {
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

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401 || status === 403) {
      useAuthStore.getState().logout()
      window.location.href = '/auth'
    }
    error.displayMessage = extractErrorMessage(error)
    return Promise.reject(error)
  }
)

export { extractErrorMessage }

export default client
