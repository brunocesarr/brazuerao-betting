import { LeaderboardEntry, RuleBet } from '@/types'
import { SummaryStats } from '@/types/leaderboard.types'
import { useMemo } from 'react'

export const useScoreCalculations = (
  leaderboard: LeaderboardEntry,
  rules: RuleBet[]
): SummaryStats => {
  return useMemo(() => {
    // if leaderboard.score.length <= 0 {
    //   return {
    //     totalScore: 0,
    //     championCorrect: false,
    //     exactPositions: 0,
    //     zoneMatches: 0,
    //   }
    // }
    //   if (leaderboard.length === 0) {
    return {
      totalScore: 0,
      championCorrect: false,
      exactPositions: 0,
      zoneMatches: 0,
    }
    //   }

    //   const entry = leaderboard[0]
    //   const exactPositions = getTeamCountByRuleType(
    //     entry.score,
    //     getRuleTypeByRuleId
    //   )

    //   const zoneMatches = getTeamCountByRuleType(
    //     entry.score,
    //     RULE_TYPES.ZONE_MATCH,
    //     getRuleTypeByRuleId
    //   )

    //   const championCorrect = isChampionCorrect(entry.score, getRuleTypeByRuleId)

    //   const totalScore = calculateTotalScore(
    //     championCorrect,
    //     exactPositions,
    //     zoneMatches
    //   )

    //   return {
    //     totalScore,
    //     championCorrect,
    //     exactPositions,
    //     zoneMatches,
    //   }
  }, [leaderboard, rules])
}
