/**
 * Domain Models - Business logic and UI data structures
 * Represents entities used within the application layers
 */

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
  isPrivate: boolean
  userId?: string
  roleGroupId?: string
  requestStatusId?: string
}
