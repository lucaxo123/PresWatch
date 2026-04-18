import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { useCreateSubscription, useUpdateSubscription } from '../../hooks/useSubscriptions'
import { useCategories } from '../../hooks/useCategories'
import { useToastStore } from '../../stores/toastStore'
import { extractErrorMessage } from '../../api/client'
import type { Subscription } from '../../types'

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255),
  amount: z.coerce.number().positive('El monto debe ser mayor a cero'),
  billingDay: z.coerce.number().int().min(1, 'Día inválido').max(31, 'Día inválido'),
  categoryId: z.string().optional(),
  startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
  endDate: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface SubscriptionFormProps {
  open: boolean
  onClose: () => void
  subscription?: Subscription
}

export const SubscriptionForm = ({ open, onClose, subscription }: SubscriptionFormProps) => {
  const { data: categories = [] } = useCategories()
  const create = useCreateSubscription()
  const update = useUpdateSubscription()
  const toastSuccess = useToastStore((s) => s.success)
  const toastError = useToastStore((s) => s.error)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      reset({
        name: subscription?.name ?? '',
        amount: subscription?.amount ?? ('' as unknown as number),
        billingDay: subscription?.billingDay ?? ('' as unknown as number),
        categoryId: subscription?.category?.id ? String(subscription.category.id) : '',
        startDate: subscription?.startDate ?? new Date().toLocaleDateString('en-CA'),
        endDate: subscription?.endDate ?? '',
      })
    }
  }, [open, subscription, reset])

  const onSubmit = (data: FormData) => {
    const payload = {
      name: data.name,
      amount: data.amount,
      billingDay: data.billingDay,
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      startDate: data.startDate,
      endDate: data.endDate || null,
    }
    if (subscription) {
      update.mutate(
        { id: subscription.id, data: payload },
        {
          onSuccess: () => {
            toastSuccess('Suscripción actualizada')
            onClose()
          },
          onError: (err) => toastError(extractErrorMessage(err)),
        }
      )
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toastSuccess('Suscripción agregada')
          onClose()
        },
        onError: (err) => toastError(extractErrorMessage(err)),
      })
    }
  }

  const isLoading = create.isPending || update.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={subscription ? 'Editar suscripción' : 'Nueva suscripción'}
      description="Registrá un gasto fijo mensual como Netflix, Spotify, etc."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nombre"
          type="text"
          placeholder="ej. Netflix"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Monto"
          type="number"
          step="0.01"
          min="0.01"
          inputMode="decimal"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount')}
        />

        <Input
          label="Día de cobro"
          type="number"
          min="1"
          max="31"
          placeholder="ej. 15"
          hint="Del 1 al 31"
          error={errors.billingDay?.message}
          {...register('billingDay')}
        />

        <Select label="Categoría" {...register('categoryId')}>
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon ? `${c.icon} ` : ''}
              {c.name}
            </option>
          ))}
        </Select>

        <Input
          label="Fecha de inicio"
          type="date"
          error={errors.startDate?.message}
          {...register('startDate')}
        />

        <Input
          label="Fecha de fin"
          type="date"
          hint="Opcional — dejar vacío si no tiene vencimiento"
          {...register('endDate')}
        />

        <div className="flex gap-2 justify-end pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            {subscription ? 'Guardar cambios' : 'Agregar suscripción'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
