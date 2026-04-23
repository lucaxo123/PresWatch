import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCard, deleteCard, getCards, updateCard } from '../api/cards'
import type { CardPayload } from '../api/cards'

export const useCards = () =>
  useQuery({
    queryKey: ['cards'],
    queryFn: getCards,
  })

export const useCreateCard = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

export const useUpdateCard = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CardPayload }) => updateCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['debts'] })
    },
  })
}

export const useDeleteCard = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['debts'] })
    },
  })
}
