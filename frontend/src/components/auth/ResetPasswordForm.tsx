import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { resetPassword } from '../../api/auth'
import { extractErrorMessage } from '../../api/client'
import { useToastStore } from '../../stores/toastStore'
import { PasswordInput } from '../ui/PasswordInput'
import { Button } from '../ui/Button'
import { passwordSchema } from '../../utils/validation'

const schema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmá la contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

interface ResetPasswordFormProps {
  token: string
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const navigate = useNavigate()
  const toastSuccess = useToastStore((s) => s.success)
  const toastError = useToastStore((s) => s.error)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => resetPassword(token, data.newPassword),
    onSuccess: () => {
      toastSuccess('Contraseña restablecida. Ya podés iniciar sesión.')
      navigate('/auth')
    },
    onError: (err: unknown) => {
      toastError(extractErrorMessage(err) || 'El link de recuperación es inválido o ya expiró.')
    },
  })

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="flex flex-col gap-4"
    >
      <PasswordInput
        label="Nueva contraseña"
        placeholder="••••••••"
        leftIcon={<Lock size={16} />}
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <PasswordInput
        label="Confirmar contraseña"
        placeholder="••••••••"
        leftIcon={<Lock size={16} />}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" loading={mutation.isPending} fullWidth className="mt-2">
        Restablecer contraseña
      </Button>
    </form>
  )
}
