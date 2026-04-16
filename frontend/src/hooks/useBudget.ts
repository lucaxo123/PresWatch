import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getBudget, upsertBudget } from '../api/budget'

export const useBudget = (month: string) =>
  useQuery({
    queryKey: ['budget', month],
    queryFn: () => getBudget(month),
  })

export const useUpsertBudget = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: upsertBudget,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budget', data.month] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
