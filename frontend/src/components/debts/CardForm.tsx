import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useCreateCard, useUpdateCard } from '../../hooks/useCards'
import { useToastStore } from '../../stores/toastStore'
import { extractErrorMessage } from '../../api/client'
import type { Card } from '../../types'

const CARD_PALETTE = [
  '#1F2937', '#0F766E', '#1D4ED8', '#7C3AED', '#9F1F3A',
  '#C2410C', '#CA8A04', '#16A34A', '#DB2777', '#52525B',
]

const schema = z.object({
  bank: z.string().min(1, 'El banco es obligatorio').max(100),
  last4: z
    .string()
    .regex(/^\d{4}$/, 'Deben ser exactamente 4 dígitos'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido'),
})

type FormData = z.infer<typeof schema>

interface CardFormProps {
  open: boolean
  onClose: () => void
  card?: Card
  onCreated?: (card: Card) => void
}

export const CardForm = ({ open, onClose, card, onCreated }: CardFormProps) => {
  const create = useCreateCard()
  const update = useUpdateCard()
  const toastSuccess = useToastStore((s) => s.success)
  const toastError = useToastStore((s) => s.error)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { bank: '', last4: '', color: CARD_PALETTE[0] },
  })

  const selectedColor = watch('color')

  useEffect(() => {
    if (open) {
      reset({
        bank: card?.bank ?? '',
        last4: card?.last4 ?? '',
        color: card?.color ?? CARD_PALETTE[0],
      })
    }
  }, [open, card, reset])

  const onSubmit = (data: FormData) => {
    if (card) {
      update.mutate(
        { id: card.id, data },
        {
          onSuccess: () => {
            toastSuccess('Tarjeta actualizada')
            onClose()
          },
          onError: (err) => toastError(extractErrorMessage(err)),
        }
      )
    } else {
      create.mutate(data, {
        onSuccess: (created) => {
          toastSuccess('Tarjeta creada')
          onCreated?.(created)
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
      title={card ? 'Editar tarjeta' : 'Nueva tarjeta'}
      description="Identificá la tarjeta con banco, últimos 4 dígitos y color."
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Banco"
          type="text"
          placeholder="ej. Santander"
          error={errors.bank?.message}
          {...register('bank')}
        />

        <Input
          label="Últimos 4 dígitos"
          type="text"
          inputMode="numeric"
          placeholder="ej. 1234"
          maxLength={4}
          error={errors.last4?.message}
          {...register('last4')}
        />

        <div>
          <label className="block text-sm font-medium text-content-secondary mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {CARD_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setValue('color', c, { shouldValidate: true })}
                aria-label={`Color ${c}`}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  selectedColor === c ? 'border-content-primary scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          {errors.color?.message && (
            <p className="text-xs text-danger mt-1">{errors.color.message}</p>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading}>
            {card ? 'Guardar cambios' : 'Crear tarjeta'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
