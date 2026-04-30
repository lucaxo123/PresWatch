import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Mail, Lock } from 'lucide-react'
import { login } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { useToastStore } from '../../stores/toastStore'
import { Input } from '../ui/Input'
import { PasswordInput } from '../ui/PasswordInput'
import { Button } from '../ui/Button'

const schema = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

type FormData = z.infer<typeof schema>

interface LoginFormProps {
  onSwitchToRegister: () => void
  onForgotPassword: () => void
}

export const LoginForm = ({ onSwitchToRegister, onForgotPassword }: LoginFormProps) => {
  const navigate = useNavigate()
  const loginStore = useAuthStore((s) => s.login)
  const toastSuccess = useToastStore((s) => s.success)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setServerError(null)
      loginStore(data.token, { userId: data.userId, email: data.email, username: data.username })
      toastSuccess(`Bienvenido, ${data.username}`)
      navigate('/app/resumen')
    },
    onError: (err: unknown) => {
      const response = (err as { response?: { data?: { message?: string }; status?: number } }).response
      const msg = response?.data?.message
      if (response?.status === 400 || response?.status === 401) {
        setServerError(msg ?? 'Email o contraseña incorrectos')
      } else {
        setServerError(msg ?? 'Ocurrió un error inesperado. Intentá de nuevo en unos segundos.')
      }
    },
  })

  return (
    <form
      onSubmit={handleSubmit((data) => {
        setServerError(null)
        mutation.mutate(data)
      })}
      className="flex flex-col gap-4"
    >
      <Input
        label="Email"
        type="email"
        placeholder="vos@ejemplo.com"
        leftIcon={<Mail size={16} />}
        error={errors.email?.message}
        {...register('email')}
      />
      <PasswordInput
        label="Contraseña"
        placeholder="••••••••"
        leftIcon={<Lock size={16} />}
        error={errors.password?.message}
        {...register('password')}
      />
      {serverError && (
        <p className="text-xs text-danger -mt-2">{serverError}</p>
      )}
      <Button type="submit" loading={mutation.isPending} fullWidth className="mt-2">
        Iniciar sesión
      </Button>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-content-muted hover:text-accent transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </button>
        <p className="text-center text-sm text-content-muted">
          ¿No tenés cuenta?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-accent font-medium hover:underline"
          >
            Crear una
          </button>
        </p>
      </div>
    </form>
  )
}
