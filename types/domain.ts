/**
 * Domain Models - Business logic and UI data structures
 * Represents entities used within the application layers
 */

import { RequestStatusEnum } from '@/helpers/constants'
import { RulesAPIResponse } from '@/types/api'
import { RequestStatusDBModel, RoleGroupDBModel } from '@/types/entities'

/**
 * Season in the Brazilian football league
 */
export interface Season {
  name: string
  id: number
  year: number
}

/**
 * Team prediction for a specific position in the standings
 */
export interface TeamPrediction {
  teamId: string
  teamName: string
  position: number
  shieldUrl?: string
}

/**
 * User's bet data with predictions and season
 */
export interface BetData {
  predictions: TeamPrediction[]
  season: number
}

/**
 * Single score entry for a user in leaderboard
 */
export interface ScoreEntry {
  ruleId: string
  score: number
  teams: string[]
}

/**
 * Score info for a bet group
 */
export interface ScoryGroupEntry {
  groupId: string
  scores: ScoreEntry[]
}

/**
 * Leaderboard entry with user info and scores
 */
export interface LeaderboardEntry {
  userId: string
  username: string
  score: ScoreEntry[]
}

/**
 * User registration payload
 */
export interface UserRegistration {
  name: string
  email: string
  password: string
}

/**
 * User profile information
 */
export interface UserProfile {
  id: string
  name: string
  email: string
  photoUrl?: string
  createdAt: Date
}

/**
 * User bet group information
 */
export interface UserBetGroup {
  groupId: string
  name: string
  challenge?: string | null
  isPrivate: boolean
  deadlineAt: Date
  allowPublicViewing: boolean
  userId?: string
  roleGroupId?: string
  requestStatusId?: string
}

/**
 * User profile information
 */
export type RuleBet = RulesAPIResponse & {}

/**
 * Group role information
 */
export type GroupRole = RoleGroupDBModel & {}

/**
 * Request status information
 */
export type RequestStatus = RequestStatusDBModel & {}

/**
 * Current Requests for bet group information
 */
export interface CurrentRequestBetGroup {
  groupId: string
  userId: string
  username: string | undefined
  email: string | undefined
  requestStatusId: string
  requestStatusDescription: RequestStatusEnum | undefined
  createdAt: Date
}

export type GroupTabType = 'my-groups' | 'find-groups'
