import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Mail, ArrowLeft } from 'lucide-react'
import { forgotPassword } from '../../api/auth'
import { useToastStore } from '../../stores/toastStore'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

const schema = z.object({
  email: z.string().email('Ingresá un email válido'),
})

type FormData = z.infer<typeof schema>

interface ForgotPasswordFormProps {
  onBackToLogin: () => void
}

export const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {
  const [submitted, setSubmitted] = useState(false)
  const toastError = useToastStore((s) => s.error)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => forgotPassword(data.email),
    onSuccess: () => {
      setSubmitted(true)
    },
    onError: () => {
      toastError('Ocurrió un error. Intentá de nuevo en unos minutos.')
    },
  })

  if (submitted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-surface-muted border border-line rounded-lg p-4">
          <p className="text-sm text-content-primary font-medium mb-1">Revisá tu email</p>
          <p className="text-sm text-content-muted">
            Si el email está registrado, recibirás un link para restablecer tu contraseña en los
            próximos minutos. El link es válido por 60 minutos.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center gap-2 text-sm text-content-muted hover:text-content-primary transition-colors"
        >
          <ArrowLeft size={14} />
          Volver al inicio de sesión
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="flex flex-col gap-4"
    >
      <p className="text-sm text-content-muted">
        Ingresá tu email y te enviaremos un link para restablecer tu contraseña.
      </p>
      <Input
        label="Email"
        type="email"
        placeholder="vos@ejemplo.com"
        leftIcon={<Mail size={16} />}
        error={errors.email?.message}
        {...register('email')}
      />
      <Button type="submit" loading={mutation.isPending} fullWidth className="mt-2">
        Enviar link de recuperación
      </Button>
      <button
        type="button"
        onClick={onBackToLogin}
        className="flex items-center justify-center gap-2 text-sm text-content-muted hover:text-content-primary transition-colors"
      >
        <ArrowLeft size={14} />
        Volver al inicio de sesión
      </button>
    </form>
  )
}
