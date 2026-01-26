/**
 * Database Entity Models - Representations of records from SQLite
 * Matches the Prisma schema structure
 */

import { RequestStatusEnum } from '@/helpers/constants'
import { Prisma } from '@prisma/client'

// ============================================================================
// BET ENTITY
// ============================================================================

/**
 * User bet stored in database
 * Represents a user's predictions for a specific season
 */
export interface UserBetDBModel {
  id: string
  userId: string
  predictions: Prisma.JsonValue
  season: number
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// SCORING RULE ENTITY
// ============================================================================

/**
 * Scoring rule from database
 * Defines how points are calculated based on prediction accuracy
 */
export interface BetRuleDBModel {
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

// ============================================================================
// USER ENTITY
// ============================================================================

/**
 * User profile stored in database
 */
export interface UserDBModel {
  id: string
  email: string
  name: string
  password: string
  photoUrl?: string | null
  createdAt: Date
}

// ============================================================================
// GROUP ENTITIES
// ============================================================================

/**
 * Bet group in database
 * Groups bets together for organization/permissions
 */
export interface BetGroupDBModel {
  id: string
  name: string
}

/**
 * Role group in database
 */
export interface RoleGroupDBModel {
  id: string
  name: string
}

/**
 * Request status for user group membership
 */
export interface RequestStatusDBModel {
  id: string
  status: RequestStatusEnum
}

/**
 * User's membership in a bet group
 */
export interface UserBetGroupDBModel {
  groupId: string
  userId: string
  roleGroupId: string
  requestStatusId: string
  createdAt: Date
}
