import { RuleTypeEnum } from '@/constants/constants'
import { z } from 'zod'

/**
 * Validation schemas for predictions and API responses
 */

export const predictionSchema = z.array(z.string()).min(1)

export const scoringRuleTypeSchema = z.enum([
  RuleTypeEnum.champion,
  RuleTypeEnum.position,
  RuleTypeEnum.zone,
])

export const rangeSchema = z.object({
  rangeStart: z.number().positive(),
  rangeEnd: z.number().positive(),
})

export const userBetPredictionsSchema = z.object({
  predictions: predictionSchema,
  season: z.number().int().positive(),
})

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(50, 'O nome não deve exceder 50 caracteres')
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      'O nome pode conter apenas letras, espaços, hífens e apóstrofos'
    )
    .trim(),
})

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .toLowerCase()
    .trim(),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(
      /[^A-Za-z0-9]/,
      'Senha deve conter pelo menos um caractere especial'
    ),
})

export type RegisterInput = z.infer<typeof registerSchema>
