import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSubscription,
  deleteSubscription,
  getSubscriptions,
  getSubscriptionTotal,
  toggleSubscription,
  updateSubscription,
} from '../api/subscriptions'
import type { SubscriptionPayload } from '../api/subscriptions'

export const useSubscriptions = () =>
  useQuery({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptions,
  })

export const useSubscriptionTotal = () =>
  useQuery({
    queryKey: ['subscriptions', 'total'],
    queryFn: getSubscriptionTotal,
  })

export const useCreateSubscription = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SubscriptionPayload }) =>
      updateSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

export const useToggleSubscription = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}
