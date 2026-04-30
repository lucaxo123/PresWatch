import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Mail, Lock, User } from 'lucide-react'
import { register as registerApi } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { useToastStore } from '../../stores/toastStore'
import { Input } from '../ui/Input'
import { PasswordInput } from '../ui/PasswordInput'
import { Button } from '../ui/Button'
import { passwordSchema } from '../../utils/validation'

const schema = z.object({
  email: z.string().email('Ingresá un email válido'),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  password: passwordSchema,
})

type FormData = z.infer<typeof schema>

const getStrength = (pwd: string): { score: number; label: string; color: string } => {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^a-zA-Z\d]/.test(pwd)) score++

  if (score <= 2) return { score, label: 'Débil', color: 'bg-danger' }
  if (score === 3) return { score, label: 'Regular', color: 'bg-warning' }
  if (score === 4) return { score, label: 'Buena', color: 'bg-warning' }
  return { score, label: 'Fuerte', color: 'bg-success' }
}

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const navigate = useNavigate()
  const loginStore = useAuthStore((s) => s.login)
  const toastSuccess = useToastStore((s) => s.success)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, setError, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const watchedPassword = watch('password', '')

  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      setServerError(null)
      if (data?.token && data?.userId) {
        loginStore(data.token, { userId: data.userId, email: data.email, username: data.username })
        toastSuccess(`¡Bienvenido a PresWatch, ${data.username}!`)
        navigate('/app/resumen')
        return
      }
      onSwitchToLogin()
    },
    onError: (err: unknown) => {
      const response = (err as { response?: { data?: { message?: string } } }).response
      const msg = response?.data?.message
      if (msg?.toLowerCase().includes('email')) {
        setError('email', { message: msg })
      } else if (msg?.toLowerCase().includes('usuario')) {
        setError('username', { message: msg })
      } else {
        setServerError(msg ?? 'Ocurrió un error inesperado. Intentá de nuevo en unos segundos.')
      }
    },
  })

  const strength = getStrength(watchedPassword ?? '')
  const showStrength = (watchedPassword?.length ?? 0) > 0

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
      <Input
        label="Nombre de usuario"
        type="text"
        placeholder="juanperez"
        leftIcon={<User size={16} />}
        error={errors.username?.message}
        {...register('username')}
      />

      <div className="flex flex-col gap-1">
        <PasswordInput
          label="Contraseña"
          placeholder="••••••••"
          leftIcon={<Lock size={16} />}
          error={errors.password?.message}
          {...register('password')}
        />
        {showStrength && (
          <div className="mt-1">
            <div className="flex gap-1 h-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    i <= strength.score ? strength.color : 'bg-surface-muted'
                  }`}
                />
              ))}
            </div>
            <p
              className={`text-xs mt-1 font-medium ${
                strength.score <= 2
                  ? 'text-danger'
                  : strength.score <= 4
                  ? 'text-warning'
                  : 'text-success'
              }`}
            >
              Contraseña {strength.label.toLowerCase()}
            </p>
          </div>
        )}
        <ul className="text-xs text-content-muted mt-1 space-y-0.5 pl-3 list-disc">
          <li className={/[A-Z]/.test(watchedPassword ?? '') ? 'text-success' : ''}>
            Una mayúscula
          </li>
          <li className={/[a-z]/.test(watchedPassword ?? '') ? 'text-success' : ''}>
            Una minúscula
          </li>
          <li className={/\d/.test(watchedPassword ?? '') ? 'text-success' : ''}>Un número</li>
          <li className={/[^a-zA-Z\d]/.test(watchedPassword ?? '') ? 'text-success' : ''}>
            Un carácter especial (!@#$%...)
          </li>
          <li className={(watchedPassword?.length ?? 0) >= 8 ? 'text-success' : ''}>
            Mínimo 8 caracteres
          </li>
        </ul>
      </div>

      {serverError && <p className="text-xs text-danger">{serverError}</p>}
      <Button type="submit" loading={mutation.isPending} fullWidth className="mt-2">
        Crear cuenta
      </Button>
      <p className="text-center text-sm text-content-muted">
        ¿Ya tenés cuenta?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-accent font-medium hover:underline"
        >
          Iniciar sesión
        </button>
      </p>
    </form>
  )
}
