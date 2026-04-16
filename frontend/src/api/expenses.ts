import client from './client'
import type { Expense, ExpenseFilters, PageResponse } from '../types'

export const getExpenses = async (filters: ExpenseFilters): Promise<PageResponse<Expense>> => {
  const params = new URLSearchParams()
  if (filters.month) params.set('month', filters.month)
  if (filters.categoryId != null) params.set('categoryId', String(filters.categoryId))
  if (filters.week) params.set('week', filters.week)
  if (filters.page != null) params.set('page', String(filters.page))
  const res = await client.get<PageResponse<Expense>>(`/expenses?${params}`)
  return res.data
}

export const createExpense = async (data: {
  amount: number
  categoryId?: number | null
  description?: string
  expenseDate: string
}): Promise<Expense> => {
  const res = await client.post<Expense>('/expenses', data)
  return res.data
}

export const updateExpense = async (
  id: number,
  data: {
    amount: number
    categoryId?: number | null
    description?: string
    expenseDate: string
  }
): Promise<Expense> => {
  const res = await client.put<Expense>(`/expenses/${id}`, data)
  return res.data
}

export const deleteExpense = async (id: number): Promise<void> => {
  await client.delete(`/expenses/${id}`)
}
