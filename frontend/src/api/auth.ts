import client from './client'
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

export const refreshToken = async (): Promise<AuthResponse> => {
  const res = await client.post<AuthResponse>('/auth/refresh')
  return res.data
}
