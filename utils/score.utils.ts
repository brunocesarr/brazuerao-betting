// utils/score.utils.ts
import { POINTS, RULE_TYPES } from '@/constants/leaderboard.constants'
import { ScoreEntry } from '@/types/domain'

export const findScoreByRuleType = (
  scores: ScoreEntry[],
  ruleType: string,
  getRuleTypeByRuleId: (ruleId: string) => string | undefined
): ScoreEntry | undefined => {
  return scores.find((score) => getRuleTypeByRuleId(score.ruleId) === ruleType)
}

export const getTeamCountByRuleType = (
  scores: ScoreEntry[],
  ruleType: string,
  getRuleTypeByRuleId: (ruleId: string) => string | undefined
): number => {
  return (
    findScoreByRuleType(scores, ruleType, getRuleTypeByRuleId)?.teams.length ||
    0
  )
}

export const isChampionCorrect = (
  scores: ScoreEntry[],
  getRuleTypeByRuleId: (ruleId: string) => string | undefined
): boolean => {
  return (
    getTeamCountByRuleType(
      scores,
      RULE_TYPES.EXACT_CHAMPION,
      getRuleTypeByRuleId
    ) === 1
  )
}

export const calculateTotalScore = (
  championCorrect: boolean,
  exactPositions: number,
  zoneMatches: number
): number => {
  const championPoints = championCorrect ? POINTS.CHAMPION : 0
  const exactPositionPoints = exactPositions * POINTS.EXACT_POSITION
  const zoneMatchPoints = zoneMatches * POINTS.ZONE_MATCH

  return championPoints + exactPositionPoints + zoneMatchPoints
}
