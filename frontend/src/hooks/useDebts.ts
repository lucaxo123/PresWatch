import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createDebt,
  deleteDebt,
  getDebts,
  getDebtsTotal,
  markDebtReceived,
  toggleDebt,
  updateDebt,
} from '../api/debts'
import type { DebtPayload } from '../api/debts'

const invalidateAll = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['debts'] })
  queryClient.invalidateQueries({ queryKey: ['calendar'] })
  queryClient.invalidateQueries({ queryKey: ['expenses'] })
  queryClient.invalidateQueries({ queryKey: ['stats'] })
}

export const useDebts = () =>
  useQuery({
    queryKey: ['debts'],
    queryFn: getDebts,
  })

export const useDebtsTotal = () =>
  useQuery({
    queryKey: ['debts', 'total'],
    queryFn: getDebtsTotal,
  })

export const useCreateDebt = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDebt,
    onSuccess: () => invalidateAll(queryClient),
  })
}

export const useUpdateDebt = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DebtPayload }) => updateDebt(id, data),
    onSuccess: () => invalidateAll(queryClient),
  })
}

export const useDeleteDebt = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDebt,
    onSuccess: () => invalidateAll(queryClient),
  })
}

export const useToggleDebt = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleDebt,
    onSuccess: () => invalidateAll(queryClient),
  })
}

export const useMarkDebtReceived = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markDebtReceived,
    onSuccess: () => invalidateAll(queryClient),
  })
}
