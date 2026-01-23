import { prisma } from '@/lib/prisma'
import { getBrazilianLeague } from '@/services/brazuerao.service'
import {
  TeamPositionAPIResponse,
  UserScoreAPIResponse,
} from '@/types/api-models'
import { BetRuleDBModel, UserBetDBModel } from '@/types/database-models'
import { hash } from 'bcryptjs'
import z from 'zod'

// MARK: - User
const existsUser = async ({
  id,
  email,
}: {
  id?: string | null
  email?: string | null
}): Promise<boolean> => {
  try {
    let user
    if (id) {
      user = await prisma.user.findUnique({
        where: { id },
      })
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email },
      })
    }
    return user != null
  } catch (error) {
    console.error('Get user error:', error)
    return false
  }
}

const createUser = async (name: string, email: string, password: string) => {
  const hashedPassword = await hash(password, 12)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

// MARK: - Rules
const getAllBetRules = async (): Promise<BetRuleDBModel[]> => {
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

// MARK: - Bets
const getUserBet = async (
  userId: string,
  season: number = new Date().getFullYear()
) => {
  const bet: UserBetDBModel | null = await prisma.bet.findUnique({
    where: {
      userId_season: {
        userId,
        season,
      },
    },
  })

  const predictionsArraySchema = z.array(z.string())
  return bet
    ? {
        ...bet,
        predictions: predictionsArraySchema.parse(bet.predictions),
      }
    : null
}

const createUserBet = async (
  userId: string,
  predictions: string[],
  season: number = new Date().getFullYear()
) => {
  const bet = await prisma.bet.upsert({
    where: {
      userId_season: {
        userId: userId,
        season,
      },
    },
    update: {
      predictions: predictions,
      updatedAt: new Date(),
    },
    create: {
      userId: userId,
      predictions: predictions,
      season,
    },
  })
  const predictionsArraySchema = z.array(z.string())
  return bet
    ? {
        ...bet,
        predictions: predictionsArraySchema.parse(bet.predictions),
      }
    : null
}

// MARK: - Score
const getUserScore = async (userId: string) => {
  const [brazilianLeague, rules, userBet] = await Promise.all([
    getBrazilianLeague(),
    getAllBetRules(),
    getUserBet(userId),
  ])

  if (!userBet) {
    throw new Error('User bet not found')
  }

  return calculateScore(userBet.predictions, rules, brazilianLeague)
}

const calculateScore = (
  predictions: string[],
  rules: BetRuleDBModel[],
  table: TeamPositionAPIResponse[]
): UserScoreAPIResponse[] => {
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
              .filter((team) => teams.includes(team.name))
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

export {
  createUser,
  createUserBet,
  existsUser,
  getAllBetRules,
  getUserBet,
  getUserScore,
}
