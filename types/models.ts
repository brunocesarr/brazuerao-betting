interface Season {
  name: string
  id: number
  year: number
}

interface TeamPrediction {
  teamId: string
  teamName: string
  position: number
  shieldUrl?: string
}

interface BetData {
  predictions: TeamPrediction[]
  season: number
}

interface LeaderboardEntry {
  userId: string
  username: string
  score: {
    ruleId: string
    score: number
    teams: string[]
  }[]
}

export type { BetData, LeaderboardEntry, Season, TeamPrediction }
