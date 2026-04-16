import client from './client'
import type { Category } from '../types'

export const getCategories = async (): Promise<Category[]> => {
  const res = await client.get<Category[]>('/categories')
  return res.data
}

export const createCategory = async (data: {
  name: string
  color: string
  icon?: string
}): Promise<Category> => {
  const res = await client.post<Category>('/categories', data)
  return res.data
}

export const updateCategory = async (
  id: number,
  data: { name: string; color: string; icon?: string }
): Promise<Category> => {
  const res = await client.put<Category>(`/categories/${id}`, data)
  return res.data
}

export const deleteCategory = async (id: number): Promise<void> => {
  await client.delete(`/categories/${id}`)
}
