import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { SegmentedControl } from '../ui/SegmentedControl'
import { CardForm } from './CardForm'
import { useCreateDebt, useUpdateDebt } from '../../hooks/useDebts'
import { useCards } from '../../hooks/useCards'
import { useCategories } from '../../hooks/useCategories'
import { useToastStore } from '../../stores/toastStore'
import { extractErrorMessage } from '../../api/client'
import type { Debt, DebtDirection, DebtType } from '../../types'

const NEW_CARD_VALUE = '__new_card__'

const schema = z
  .object({
    name: z.string().min(1, 'El nombre es obligatorio').max(255),
    direction: z.enum(['OWED_BY_ME', 'OWED_TO_ME']),
    type: z.enum(['INSTALLMENTS', 'SINGLE']),
    amountPerInstallment: z.coerce.number().positive('El monto debe ser mayor a cero'),
    installmentsTotal: z.string().optional(),
    installmentsPaid: z.string().optional(),
    paymentDay: z.string().optional(),
    dueDate: z.string().optional(),
    startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
    categoryId: z.string().optional(),
    cardId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'INSTALLMENTS') {
      const total = Number(data.installmentsTotal)
      const paid = data.installmentsPaid ? Number(data.installmentsPaid) : 0
      const day = Number(data.paymentDay)
      if (!data.installmentsTotal || !Number.isFinite(total) || total < 1) {
        ctx.addIssue({
          path: ['installmentsTotal'],
          code: z.ZodIssueCode.custom,
          message: 'Total de cuotas inválido',
        })
      }
      if (!data.paymentDay || !Number.isFinite(day) || day < 1 || day > 31) {
        ctx.addIssue({
          path: ['paymentDay'],
          code: z.ZodIssueCode.custom,
          message: 'Día de pago entre 1 y 31',
        })
      }
      if (data.installmentsPaid && (!Number.isFinite(paid) || paid < 0)) {
        ctx.addIssue({
          path: ['installmentsPaid'],
          code: z.ZodIssueCode.custom,
          message: 'Cuotas pagadas inválido',
        })
      }
      if (Number.isFinite(total) && Number.isFinite(paid) && paid > total) {
        ctx.addIssue({
          path: ['installmentsPaid'],
          code: z.ZodIssueCode.custom,
          message: 'No puede ser mayor al total',
        })
      }
    } else {
      if (!data.dueDate) {
        ctx.addIssue({
          path: ['dueDate'],
          code: z.ZodIssueCode.custom,
          message: 'La fecha de vencimiento es obligatoria',
        })
      }
    }
  })

type FormData = z.input<typeof schema>

interface DebtFormProps {
  open: boolean
  onClose: () => void
  debt?: Debt
  defaultDirection?: DebtDirection
}

const formatAmount = (amount: number): string =>
  `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`

export const DebtForm = ({ open, onClose, debt, defaultDirection = 'OWED_BY_ME' }: DebtFormProps) => {
  const { data: cards = [] } = useCards()
  const { data: categories = [] } = useCategories()
  const create = useCreateDebt()
  const update = useUpdateDebt()
  const toastSuccess = useToastStore((s) => s.success)
  const toastError = useToastStore((s) => s.error)

  const [cardModalOpen, setCardModalOpen] = useState(false)
  const cardSelectRef = useRef<HTMLSelectElement | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      direction: defaultDirection,
      type: 'INSTALLMENTS',
      amountPerInstallment: '' as unknown as number,
      installmentsTotal: '',
      installmentsPaid: '0',
      paymentDay: '',
      dueDate: '',
      startDate: new Date().toLocaleDateString('en-CA'),
      categoryId: '',
      cardId: '',
    },
  })

  const direction = watch('direction')
  const type = watch('type')
  const amountStr = watch('amountPerInstallment')
  const totalStr = watch('installmentsTotal')

  useEffect(() => {
    if (open) {
      reset({
        name: debt?.name ?? '',
        direction: debt?.direction ?? defaultDirection,
        type: debt?.type ?? 'INSTALLMENTS',
        amountPerInstallment: debt?.amountPerInstallment ?? ('' as unknown as number),
        installmentsTotal: debt?.installmentsTotal != null ? String(debt.installmentsTotal) : '',
        installmentsPaid: debt?.installmentsPaid != null ? String(debt.installmentsPaid) : '0',
        paymentDay: debt?.paymentDay != null ? String(debt.paymentDay) : '',
        dueDate: debt?.dueDate ?? '',
        startDate: debt?.startDate ?? new Date().toLocaleDateString('en-CA'),
        categoryId: debt?.category?.id ? String(debt.category.id) : '',
        cardId: debt?.card?.id ? String(debt.card.id) : '',
      })
    }
  }, [open, debt, reset, defaultDirection])

  const onSubmit = (data: FormData) => {
    const isInstallments = data.type === 'INSTALLMENTS'
    const payload = {
      name: data.name,
      direction: data.direction as DebtDirection,
      type: data.type as DebtType,
      amountPerInstallment: Number(data.amountPerInstallment),
      installmentsTotal: isInstallments ? Number(data.installmentsTotal) : null,
      installmentsPaid: isInstallments ? Number(data.installmentsPaid || 0) : null,
      paymentDay: isInstallments ? Number(data.paymentDay) : null,
      dueDate: isInstallments ? null : data.dueDate || null,
      startDate: data.startDate,
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      cardId: data.cardId ? Number(data.cardId) : null,
    }
    if (debt) {
      update.mutate(
        { id: debt.id, data: payload },
        {
          onSuccess: () => {
            toastSuccess('Deuda actualizada')
            onClose()
          },
          onError: (err) => toastError(extractErrorMessage(err)),
        }
      )
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toastSuccess('Deuda creada')
          onClose()
        },
        onError: (err) => toastError(extractErrorMessage(err)),
      })
    }
  }

  const handleCardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === NEW_CARD_VALUE) {
      setCardModalOpen(true)
      setValue('cardId', '')
      e.target.value = ''
    } else {
      setValue('cardId', e.target.value)
    }
  }

  const isLoading = create.isPending || update.isPending
  const { ref: cardFieldRef, ...cardRest } = register('cardId')

  const totalAmount =
    type === 'INSTALLMENTS' && Number(amountStr) > 0 && Number(totalStr) > 0
      ? Number(amountStr) * Number(totalStr)
      : null

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={debt ? 'Editar deuda' : 'Nueva deuda'}
        description="Registrá una deuda con o sin cuotas, asociada o no a una tarjeta."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-2">
              Tipo de deuda
            </label>
            <SegmentedControl<DebtDirection>
              value={direction}
              onChange={(v) => setValue('direction', v)}
              options={[
                { value: 'OWED_BY_ME', label: 'Yo debo' },
                { value: 'OWED_TO_ME', label: 'Me deben' },
              ]}
              ariaLabel="Dirección de la deuda"
            />
          </div>

          <Input
            label="Nombre"
            type="text"
            placeholder="ej. Notebook"
            error={errors.name?.message}
            {...register('name')}
          />

          <div>
            <label className="block text-sm font-medium text-content-secondary mb-2">
              Forma de pago
            </label>
            <SegmentedControl<DebtType>
              value={type}
              onChange={(v) => setValue('type', v)}
              options={[
                { value: 'INSTALLMENTS', label: 'En cuotas' },
                { value: 'SINGLE', label: 'Pago único' },
              ]}
              ariaLabel="Forma de pago"
            />
          </div>

          <Input
            label={type === 'INSTALLMENTS' ? 'Monto por cuota' : 'Monto'}
            type="number"
            step="0.01"
            min="0.01"
            inputMode="decimal"
            placeholder="0.00"
            error={errors.amountPerInstallment?.message}
            {...register('amountPerInstallment')}
          />

          {type === 'INSTALLMENTS' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Cuotas pagadas"
                  type="number"
                  min="0"
                  placeholder="0"
                  error={errors.installmentsPaid?.message}
                  {...register('installmentsPaid')}
                />
                <Input
                  label="Cuotas totales"
                  type="number"
                  min="1"
                  placeholder="ej. 12"
                  error={errors.installmentsTotal?.message}
                  {...register('installmentsTotal')}
                />
              </div>

              <Input
                label="Día de pago mensual"
                type="number"
                min="1"
                max="31"
                placeholder="ej. 10"
                hint="Del 1 al 31"
                error={errors.paymentDay?.message}
                {...register('paymentDay')}
              />

              {totalAmount != null && (
                <div className="rounded-lg bg-surface-muted/60 border border-line p-3 text-sm flex items-center justify-between">
                  <span className="text-content-secondary">Total a {direction === 'OWED_BY_ME' ? 'pagar' : 'cobrar'}</span>
                  <span className="font-semibold tabular-nums text-content-primary">
                    {formatAmount(totalAmount)}
                  </span>
                </div>
              )}
            </>
          ) : (
            <Input
              label="Fecha de pago"
              type="date"
              error={errors.dueDate?.message}
              {...register('dueDate')}
            />
          )}

          <Select
            label="Tarjeta"
            {...cardRest}
            ref={(el) => {
              cardFieldRef(el)
              cardSelectRef.current = el
            }}
            onChange={handleCardChange}
          >
            <option value="">Sin tarjeta</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.bank} ····{c.last4}
              </option>
            ))}
            <option value={NEW_CARD_VALUE}>+ Crear nueva tarjeta…</option>
          </Select>

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

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={isLoading}>
              {debt ? 'Guardar cambios' : 'Crear deuda'}
            </Button>
          </div>
        </form>
      </Modal>

      <CardForm
        open={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        onCreated={(card) => {
          setValue('cardId', String(card.id))
          if (cardSelectRef.current) cardSelectRef.current.value = String(card.id)
        }}
      />
    </>
  )
}
