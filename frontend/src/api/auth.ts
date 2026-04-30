import client, { refreshClient } from './client'
import type { AuthResponse, User } from '../types'

export const register = async (data: {
  email: string
  username: string
  password: string
}): Promise<AuthResponse> => {
  const res = await client.post<AuthResponse>('/auth/register', data)
  return res.data
}

export const login = async (data: {
  email: string
  password: string
}): Promise<AuthResponse> => {
  const res = await client.post<AuthResponse>('/auth/login', data)
  return res.data
}

export const getMe = async (): Promise<User> => {
  const res = await client.get<User>('/auth/me')
  return res.data
}

// Uses the HttpOnly refresh token cookie — no Bearer token needed
export const silentRefresh = async (): Promise<AuthResponse> => {
  const res = await refreshClient.post<AuthResponse>('/auth/refresh')
  return res.data
}

export const logout = async (): Promise<void> => {
  await client.post('/auth/logout').catch(() => {
    // Best-effort — clear client state regardless of server response
  })
}

export const forgotPassword = async (email: string): Promise<void> => {
  await client.post('/auth/forgot-password', { email })
}

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await client.post('/auth/reset-password', { token, newPassword })
}
