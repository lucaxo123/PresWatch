import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createExpense, deleteExpense, getExpenses, updateExpense } from '../api/expenses'
import type { ExpenseFilters } from '../types'

export const useExpenses = (filters: ExpenseFilters) =>
  useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => getExpenses(filters),
  })

export const useCreateExpense = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export const useUpdateExpense = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateExpense>[1] }) =>
      updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export const useDeleteExpense = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
