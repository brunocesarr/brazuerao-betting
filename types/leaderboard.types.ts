import { LeaderboardEntry } from '@/types/domain'

export interface SummaryStats {
  totalScore: number
  championCorrect: boolean
  exactPositions: number
  zoneMatches: number
}

export interface LeaderboardRowProps {
  entry: LeaderboardEntry
  index: number
  stats: SummaryStats
  isExpanded: boolean
  isCurrentUser: boolean
  selectedGroup: string
  onToggle: (userId: string) => void
  getRuleTypeByRuleId: (ruleId: string) => string | undefined
}
