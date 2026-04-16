import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { useCreateExpense, useUpdateExpense } from '../../hooks/useExpenses'
import { useCategories, useCreateCategory } from '../../hooks/useCategories'
import { useToastStore } from '../../stores/toastStore'
import { extractErrorMessage } from '../../api/client'
import type { Expense } from '../../types'

const NEW_CATEGORY_VALUE = '__new__'

const schema = z.object({
  amount: z.coerce.number().positive('El monto debe ser mayor a cero'),
  categoryId: z.string().optional(),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  expenseDate: z.string().min(1, 'La fecha es obligatoria'),
})

type FormData = z.infer<typeof schema>

interface ExpenseFormProps {
  open: boolean
  onClose: () => void
  expense?: Expense
}

const PALETTE = ['#9F1F3A', '#C13758', '#C2410C', '#CA8A04', '#16A34A', '#0D9488', '#2563EB', '#7C3AED', '#DB2777', '#78716C']

export const ExpenseForm = ({ open, onClose, expense }: ExpenseFormProps) => {
  const { data: categories = [] } = useCategories()
  const create = useCreateExpense()
  const update = useUpdateExpense()
  const createCategory = useCreateCategory()
  const toastSuccess = useToastStore((s) => s.success)
  const toastError = useToastStore((s) => s.error)

  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(PALETTE[0])
  const [newCategoryIcon, setNewCategoryIcon] = useState('')
  const pendingSelectRef = useRef<HTMLSelectElement | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      reset({
        amount: expense?.amount ?? ('' as unknown as number),
        categoryId: expense?.category?.id ? String(expense.category.id) : '',
        description: expense?.description ?? '',
        expenseDate: expense?.expenseDate ?? new Date().toISOString().split('T')[0],
      })
    }
  }, [open, expense, reset])

  const onSubmit = (data: FormData) => {
    const payload = {
      amount: data.amount,
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      description: data.description || undefined,
      expenseDate: data.expenseDate,
    }
    if (expense) {
      update.mutate(
        { id: expense.id, data: payload },
        {
          onSuccess: () => {
            toastSuccess('Gasto actualizado')
            onClose()
          },
          onError: (err) => toastError(extractErrorMessage(err)),
        }
      )
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toastSuccess('Gasto agregado')
          onClose()
        },
        onError: (err) => toastError(extractErrorMessage(err)),
      })
    }
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === NEW_CATEGORY_VALUE) {
      setNewCategoryName('')
      setNewCategoryIcon('')
      setNewCategoryColor(PALETTE[0])
      setCategoryModalOpen(true)
      setValue('categoryId', '')
      e.target.value = ''
    } else {
      setValue('categoryId', e.target.value)
    }
  }

  const handleCreateCategory = () => {
    const name = newCategoryName.trim()
    if (!name) return
    createCategory.mutate(
      { name, color: newCategoryColor, icon: newCategoryIcon.trim() || undefined },
      {
        onSuccess: (cat) => {
          toastSuccess('Categoría creada')
          setCategoryModalOpen(false)
          setValue('categoryId', String(cat.id))
          if (pendingSelectRef.current) {
            pendingSelectRef.current.value = String(cat.id)
          }
        },
        onError: () => toastError('No se pudo crear la categoría'),
      }
    )
  }

  const isLoading = create.isPending || update.isPending
  const { ref: categoryFieldRef, ...categoryRest } = register('categoryId')

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={expense ? 'Editar gasto' : 'Nuevo gasto'}
        description="Registrá el movimiento con monto, categoría y fecha."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

          <Select
            label="Categoría"
            {...categoryRest}
            ref={(el) => {
              categoryFieldRef(el)
              pendingSelectRef.current = el
            }}
            onChange={handleCategoryChange}
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ''}
                {c.name}
              </option>
            ))}
            <option value={NEW_CATEGORY_VALUE}>+ Crear nueva categoría…</option>
          </Select>

          <Input
            label="Descripción"
            type="text"
            placeholder="ej. Almuerzo en el trabajo"
            hint="Opcional"
            error={errors.description?.message}
            {...register('description')}
          />

          <Input
            label="Fecha"
            type="date"
            error={errors.expenseDate?.message}
            {...register('expenseDate')}
          />

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={isLoading}>
              {expense ? 'Guardar cambios' : 'Agregar gasto'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="Nueva categoría"
        description="Creá una categoría personalizada para organizar tus gastos."
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nombre"
            placeholder="ej. Suscripciones"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            autoFocus
          />
          <Input
            label="Ícono (emoji)"
            placeholder="ej. 🎬"
            hint="Opcional"
            value={newCategoryIcon}
            onChange={(e) => setNewCategoryIcon(e.target.value)}
            maxLength={4}
          />
          <div>
            <label className="block text-sm font-medium text-content-secondary mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewCategoryColor(c)}
                  aria-label={`Color ${c}`}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    newCategoryColor === c
                      ? 'border-content-primary scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCategoryModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateCategory}
              loading={createCategory.isPending}
              disabled={!newCategoryName.trim()}
            >
              Crear categoría
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
