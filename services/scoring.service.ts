import { TeamPositionAPIResponse, UserScoreAPIResponse } from '@/types/api'
import { BetRuleDBModel } from '@/types/entities'

/**
 * Scoring service - handles prediction scoring logic
 */

interface RuleScoreResult {
  ruleId: string
  scoredTeams: string[]
}

/**
 * Calculates which teams match each scoring rule
 */
function scoreByRule(
  rule: BetRuleDBModel,
  predictions: string[],
  table: TeamPositionAPIResponse[]
): RuleScoreResult {
  const scoredTeams: string[] = []

  switch (rule.ruleType) {
    case 'EXACT_CHAMPION':
      if (table.find((team) => team.position === 1)?.name === predictions[0]) {
        scoredTeams.push(predictions[0])
      }
      break

    case 'EXACT_POSITION':
      if (rule.ranges) {
        rule.ranges.forEach((range) => {
          const teamsInRange = table.filter(
            (team) =>
              team.position >= range.rangeStart &&
              team.position <= range.rangeEnd
          )
          teamsInRange.forEach((team) => {
            if (team.name === predictions[team.position - 1]) {
              scoredTeams.push(team.name)
            }
          })
        })
      } else {
        table.forEach((team) => {
          if (team.name === predictions[team.position - 1]) {
            scoredTeams.push(team.name)
          }
        })
      }
      break

    case 'ZONE_MATCH':
      rule.ranges?.forEach((range) => {
        const teamsInRange = table.filter(
          (team) =>
            team.position >= range.rangeStart && team.position <= range.rangeEnd
        )
        const predictedTeamsInRange = predictions.slice(
          range.rangeStart - 1,
          range.rangeEnd
        )
        teamsInRange.forEach((team) => {
          if (predictedTeamsInRange.includes(team.name)) {
            scoredTeams.push(team.name)
          }
        })
      })
      break
  }

  return {
    ruleId: rule.id,
    scoredTeams,
  }
}

/**
 * Calculates final scores by removing duplicate teams across rules
 * Each team can only score once (in the first rule it matches)
 */
export function calculateScore(
  predictions: string[],
  rules: BetRuleDBModel[],
  table: TeamPositionAPIResponse[]
): UserScoreAPIResponse[] {
  // Score each rule
  const scoresByRule = rules.map((rule) =>
    scoreByRule(rule, predictions, table)
  )

  // Remove duplicates: teams can only score in their first matching rule
  return scoresByRule.map((score, index) => {
    const previousTeams = new Set(
      scoresByRule.slice(0, index).flatMap((rule) => rule.scoredTeams)
    )

    const uniqueTeams = score.scoredTeams.filter(
      (team) => !previousTeams.has(team)
    )
    const rulePoints =
      rules.find((rule) => rule.id === score.ruleId)?.points ?? 0

    return {
      ruleId: score.ruleId,
      score: uniqueTeams.length * rulePoints,
      teams: uniqueTeams,
    }
  })
}
