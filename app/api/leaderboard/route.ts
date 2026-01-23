import { authOptions } from '@/lib/auth'
import {
  existsUser,
  getAllBetRules,
  getUserBet,
} from '@/repositories/brazuerao.repository'
import { getBrazilianLeague } from '@/services/brazuerao.service'
import { TeamPositionAPIResponse } from '@/types/api'
import { BetRuleDBModel } from '@/types/entities'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(
      searchParams.get('year') || `${new Date().getFullYear()}`
    )

    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const existingUser = await existsUser({ id: session.user.id })
    if (!existingUser) {
      throw new Error('User not found')
    }

    const [brazilianLeague, rules, userBet] = await Promise.all([
      getBrazilianLeague(),
      getAllBetRules(),
      getUserBet(session.user.id),
    ])

    if (!userBet) {
      throw new Error('User bet not found')
    }

    const leaderboard = calculateScore(
      userBet.predictions,
      rules,
      brazilianLeague
    )

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar classificação' },
      { status: 500 }
    )
  }
}

const calculateScore = (
  predictions: string[],
  rules: BetRuleDBModel[],
  table: TeamPositionAPIResponse[]
) => {
  const scoresByRule = rules.map((rule) => {
    let scoredTeams: string[] = []
    switch (rule.ruleType) {
      case 'EXACT_CHAMPION':
        if (
          table.find((teamPositionInfo) => teamPositionInfo.position === 1)
            ?.name === predictions[0]
        ) {
          scoredTeams = [predictions[0]]
        }
        break
      case 'EXACT_POSITION':
        if (rule.ranges) {
          rule.ranges.forEach((range) => {
            let teamsInRange = table.filter(
              (team) =>
                team.position >= range.rangeStart &&
                team.position <= range.rangeEnd
            )
            scoredTeams = [
              ...scoredTeams,
              ...teamsInRange
                .filter((team) => team.name === predictions[team.position - 1])
                .map((team) => team.name),
            ]
          })
        } else {
          scoredTeams = table
            .filter((team) => team.name === predictions[team.position - 1])
            .map((team) => team.name)
        }
        break
      case 'ZONE_MATCH':
        rule.ranges?.forEach((range) => {
          let teamsInRange = table.filter(
            (team) =>
              team.position >= range.rangeStart &&
              team.position <= range.rangeEnd
          )
          let teams = predictions.slice(
            range.rangeStart - 1,
            range.rangeEnd - 1
          )
          scoredTeams = [
            ...scoredTeams,
            ...teamsInRange
              .filter((team) => predictions.includes(team.name))
              .map((team) => team.name),
          ]
        })
        break
    }
    return {
      ruleId: rule.id,
      scoredTeams,
    }
  })

  return scoresByRule.map((score, index) => {
    // Get all team names from previous rules (0 to index-1)
    const existingTeamNames = new Set(
      index > 0
        ? scoresByRule
            .slice(0, index) // Fixed: was index - 1, should be index
            .flatMap((rule) => rule.scoredTeams) // Fixed: use flatMap instead of map().flat()
        : []
    )

    // Filter out teams that already exist in previous rules
    const teams = score.scoredTeams.filter((team) => {
      return !existingTeamNames.has(team)
    })

    return {
      ruleId: score.ruleId,
      score:
        teams.length *
        (rules.find((rule) => rule.id === score.ruleId)?.points ?? 0), // Include score if needed
      teams,
    }
  })
}
