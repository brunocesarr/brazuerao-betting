import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCurrentBrazilianLeague } from '@/services/brazuerao.service'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const brazilianLeague = await getCurrentBrazilianLeague()
    const bet = await getBetByUserId(session.user.id, 2026)
    const rules = await getAllBetRules()

    const scoreByRule = rules.map((rule) => {
      let teams: string[] = []
      switch (rule.ruleType) {
        case 'EXACT_CHAMPION':
          if (
            brazilianLeague.find((team) => team.position === 1).name ===
            bet?.predictions[0]
          ) {
            teams = [bet?.predictions[0]]
          }
          break
        case 'EXACT_POSITION':
          if (rule.ranges) {
            rule.ranges.forEach((range) => {
              let teamsInRange = brazilianLeague.filter(
                (team) =>
                  team.position >= range.rangeStar &&
                  team.position <= range.rangeEnd
              )
              teams = [
                ...teams,
                ...teamsInRange
                  .filter(
                    (team) => team.name === bet?.predictions[team.position - 1]
                  )
                  .map((team) => team.name),
              ]
            })
          } else {
            teams = brazilianLeague
              .filter(
                (team) => team.name === bet?.predictions[team.position - 1]
              )
              .map((team) => team.name)
          }
          break
        case 'ZONE_MATCH':
          rule.ranges.forEach((range) => {
            let teamsInRange = brazilianLeague.filter(
              (team) =>
                team.position >= range.rangeStart &&
                team.position <= range.rangeEnd
            )
            let predictions = bet?.predictions.slice(
              range.start - 1,
              range.rangeEnd - 1
            )
            teams = [
              ...teams,
              ...teamsInRange
                .filter((team) => predictions.includes(team.name))
                .map((team) => team.name),
            ]
          })
          break
      }

      return {
        ruleId: rule.id,
        teams,
      }
    })

    const formattedScore = scoreByRule.map((score, index) => {
      // Get all team names from previous rules (0 to index-1)
      const existingTeamNames = new Set(
        index > 0
          ? scoreByRule
              .slice(0, index) // Fixed: was index - 1, should be index
              .flatMap((rule) => rule.teams) // Fixed: use flatMap instead of map().flat()
              .map((team) => (typeof team === 'string' ? team : team.name)) // Fixed: extract name for objects
          : []
      )

      // Filter out teams that already exist in previous rules
      const teams = score.teams.filter((team) => {
        const teamName = typeof team === 'string' ? team : team.name
        return !existingTeamNames.has(teamName)
      })

      return {
        ruleId: score.ruleId,
        score:
          teams.length *
          (rules.find((rule) => rule.id === score.ruleId)?.points ?? 0), // Include score if needed
        teams,
      }
    })

    return NextResponse.json({
      score: formattedScore.reduce((sum, item) => sum + item.score, 0),
      details: formattedScore,
    })
  } catch (error) {
    console.error('Error fetching bet rules:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar regras' },
      { status: 500 }
    )
  }
}

const getBetByUserId = async (userId: string, season: number) => {
  const bet = await prisma.bet.findUnique({
    where: {
      userId_season: {
        userId: userId,
        season,
      },
    },
  })
  return bet
    ? {
        ...bet,
        predictions:
          typeof bet.predictions === 'string'
            ? JSON.parse(bet.predictions)
            : bet.predictions,
      }
    : null
}

const getAllBetRules = async () => {
  const rules = await prisma.scoringRule.findMany({
    where: {
      isActive: true,
    },
  })
  return rules.map((rule) => ({
    ...rule,
    ranges:
      typeof rule.ranges === 'string' ? JSON.parse(rule.ranges) : rule.ranges,
  }))
}
