/**
 * API Request/Response Models - Contracts with external APIs
 * Organized by domain and data flow direction
 */

import { CurrentRequestBetGroup } from '@/types/domain'

// ============================================================================
// SEASON MODELS
// ============================================================================

/**
 * Season representation from SofaScore API
 */
export interface SeasonAPIResponse {
  id: number
  year: string
  name: string
  editor: boolean
}

/**
 * Wrapper for seasons endpoint response
 */
export interface SeasonsAPIResponse {
  seasons: {
    id: number
    year: number
    name: string
  }[]
}

// ============================================================================
// STANDINGS & LEAGUE MODELS
// ============================================================================

/**
 * Team position information in league standings
 */
export interface TeamPositionAPIResponse {
  position: number
  played: number
  name: string
  shield?: string
}

// ============================================================================
// BET & PREDICTION MODELS
// ============================================================================

/**
 * Request model for saving bets to Brazuerao API
 */
export interface BetBrazueraoAPIRequest {
  username: string
  classification: string[]
}

/**
 * User bet response from API
 */
export interface UserBetAPIResponse {
  id: string
  userId: string
  predictions: string[]
  season: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Current requests for bet response from API
 */
export type CurrentRequestBetGroupAPIResponse = CurrentRequestBetGroup & {}

// ============================================================================
// SCORING & RULES MODELS
// ============================================================================

/**
 * Scoring rule definition from API
 */
export interface RulesAPIResponse {
  id: string
  ruleType: 'EXACT_CHAMPION' | 'EXACT_POSITION' | 'ZONE_MATCH'
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

/**
 * User score result from scoring calculation
 */
export interface UserScoreAPIResponse {
  ruleId: string
  score: number
  teams: string[]
}
