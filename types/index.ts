declare module 'next-auth' {
  interface User {
    id: string
  }
  interface Session {
    user: User
  }
}

export interface TeamPrediction {
  teamId: string
  teamName: string
  position: number
  shieldUrl?: string
}

export interface BetData {
  predictions: TeamPrediction[]
  year: number
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  correctGuesses: number
  year: number
}

export interface Season {
  id: number
  year: string
  name: string
  editor: boolean
}

export interface SeasonsResponse {
  seasons: Season[]
}

export interface UserScoreAPIResponse {
  score: number
  isCurrentChampionCorrect: boolean
  teamsInCorrectsPositions: string[]
  teamsInCorrectZones: string[]
}

export interface BetBrazueraoAPIRequest {
  username: string
  classification: string[]
}
