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

export interface Standing {
  position: number
  teamId: string
  teamName: string
  points?: number
  played?: number
  won?: number
  drawn?: number
  lost?: number
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
