import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
  .regex(/[a-z]/, 'Debe incluir al menos una minúscula')
  .regex(/\d/, 'Debe incluir al menos un número')
  .regex(/[^a-zA-Z\d]/, 'Debe incluir al menos un carácter especial (!@#$%...)')
