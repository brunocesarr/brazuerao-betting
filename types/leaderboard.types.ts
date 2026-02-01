import { LeaderboardEntry, RuleBet } from '@/types/domain'

export interface SummaryStats {
  totalScore: number
  championCorrect: boolean
  exactPositions: number
  zoneMatches: number
}

export interface LeaderboardRowProps {
  entry: LeaderboardEntry
  index: number
  isExpanded: boolean
  isCurrentUser: boolean
  selectedGroup: string
  onToggle: (userId: string) => void
  getRuleByRuleId: (ruleId: string) => RuleBet | undefined
}
