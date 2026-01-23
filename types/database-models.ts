import { Prisma } from '@prisma/client'

interface UserBetDBModel {
  id: string
  userId: string
  predictions: Prisma.JsonValue
  season: number
  createdAt: Date
  updatedAt: Date
}

interface BetRuleDBModel {
  id: string
  ruleType: string
  description: string
  points: number
  priority: number
  ranges?: {
    rangeStart: number
    rangeEnd: number
  }[]
  isActive: boolean
  createdAt: Date
}

export type { BetRuleDBModel, UserBetDBModel }
