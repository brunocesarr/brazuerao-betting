declare module 'next-auth' {
  interface User {
    id: string
  }
  interface Session {
    user: User
  }
}

// Domain models - Business logic and UI structures
export type {
  BetData,
  LeaderboardEntry,
  ScoreEntry,
  Season,
  TeamPrediction,
  UserProfile,
  UserRegistration,
} from './domain'

// API models - External API contracts
export type {
  BetBrazueraoAPIRequest,
  RulesAPIResponse,
  SeasonAPIResponse,
  SeasonsAPIResponse,
  TeamPositionAPIResponse,
  UserBetAPIResponse,
  UserScoreAPIResponse,
} from './api'

// Database entity models - SQLite representations
export type {
  BetGroupDBModel,
  BetRuleDBModel,
  RequestStatusDBModel,
  RoleGroupDBModel,
  UserBetDBModel,
  UserBetGroupDBModel,
  UserDBModel,
} from './entities'
