import { RuleTypeEnum } from '@/constants/constants'
import {
  RULE_COLORS,
  RULE_ICONS,
  RuleColorKey,
} from '@/constants/leaderboard.constants'

const getRuleColorKeyByRuleType = (ruleType?: string): RuleColorKey => {
  switch (ruleType) {
    case RuleTypeEnum.champion:
      return 'champion'
    case RuleTypeEnum.position:
      return 'position'
    case RuleTypeEnum.zone:
      return 'zone'
    default:
      return 'default'
  }
}

export const getRuleIcon = (ruleType?: string) => {
  const key = getRuleColorKeyByRuleType(ruleType)
  return RULE_ICONS[key] || RULE_ICONS.default
}

export const getRuleColors = (ruleType?: string) => {
  const key = getRuleColorKeyByRuleType(ruleType)
  return RULE_COLORS[key] || RULE_COLORS.default
}

export const calculateScoredRules = (
  score: Array<{ score: number }>
): number => {
  return score.filter((entry) => entry.score > 0).length
}
