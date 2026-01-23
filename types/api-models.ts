interface SeasonAPIResponse {
  id: number
  year: string
  name: string
  editor: boolean
}

interface SeasonsAPIResponse {
  seasons: {
    id: number
    year: number
    name: string
  }[]
}

interface UserScoreAPIResponse {
  ruleId: string
  score: number
  teams: string[]
}

interface BetBrazueraoAPIRequest {
  username: string
  classification: string[]
}

interface RulesAPIResponse {
  id: string
  ruleType: 'EXACT_CHAMPION' | 'EXACT_POSITION' | 'ZONE_MATCH'
  description: string
  points: number
  priority: number
  ranges?: {
    rangeStart: number
    rangeEnd: number
  }
  isActive: boolean
  createdAt: Date
}

interface UserBetAPIResponse {
  id: string
  userId: string
  predictions: string[]
  season: number
  createdAt: Date
  updatedAt: Date
}

interface TeamPositionAPIResponse {
  position: number
  played: number
  name: string
  shield?: string
}

export type {
  BetBrazueraoAPIRequest,
  RulesAPIResponse,
  SeasonAPIResponse,
  SeasonsAPIResponse,
  TeamPositionAPIResponse,
  UserBetAPIResponse,
  UserScoreAPIResponse,
}
