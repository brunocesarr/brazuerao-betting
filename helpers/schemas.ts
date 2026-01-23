import { z } from 'zod'

/**
 * Validation schemas for predictions and API responses
 */

export const predictionSchema = z.array(z.string()).min(1)

export const scoringRuleTypeSchema = z.enum([
  'EXACT_CHAMPION',
  'EXACT_POSITION',
  'ZONE_MATCH',
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
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(
      /^[a-zA-ZÀ-ÿ\s'-]+$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .trim(),
})

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
