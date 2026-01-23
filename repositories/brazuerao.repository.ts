import { predictionSchema, userBetPredictionsSchema } from '@/helpers/schemas'
import { prisma } from '@/lib/prisma'
import { getBrazilianLeague } from '@/services/brazuerao.service'
import { calculateScore } from '@/services/scoring.service'
import { UserProfile } from '@/types'
import { UserScoreAPIResponse } from '@/types/api'
import { BetRuleDBModel, UserBetDBModel } from '@/types/entities'
import { hash } from 'bcryptjs'

// MARK: - User
const existsUser = async ({
  id,
  email,
}: {
  id?: string | null
  email?: string | null
}): Promise<boolean> => {
  try {
    if (!id && !email) {
      return false
    }

    const user = await prisma.user.findUnique({
      where: id ? { id } : { email: email! },
    })
    return user != null
  } catch (error) {
    console.error('Get user error:', error)
    return false
  }
}

const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  return user as UserProfile
}

const createUser = async (name: string, email: string, password: string) => {
  try {
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
  } catch (error) {
    console.error('Create user error:', error)
    throw new Error('Failed to create user')
  }
}

// MARK: - Rules
const getAllBetRules = async (): Promise<BetRuleDBModel[]> => {
  try {
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
  } catch (error) {
    console.error('Get all bet rules error:', error)
    throw new Error('Failed to fetch bet rules')
  }
}

// MARK: - Bets
const getUserBet = async (
  userId: string,
  season: number = new Date().getFullYear()
): Promise<UserBetDBModel | null> => {
  try {
    const bet = await prisma.bet.findUnique({
      where: {
        userId_season: {
          userId,
          season,
        },
      },
    })

    if (!bet) {
      return null
    }

    return {
      ...bet,
      predictions: predictionSchema.parse(bet.predictions),
    }
  } catch (error) {
    console.error('Get user bet error:', error)
    throw new Error('Failed to fetch user bet')
  }
}

const createUserBet = async (
  userId: string,
  predictions: string[],
  season: number = new Date().getFullYear()
): Promise<UserBetDBModel> => {
  try {
    // Validate input
    const validatedData = userBetPredictionsSchema.parse({
      predictions,
      season,
    })

    const bet = await prisma.bet.upsert({
      where: {
        userId_season: {
          userId,
          season: validatedData.season,
        },
      },
      update: {
        predictions: validatedData.predictions,
        updatedAt: new Date(),
      },
      create: {
        userId,
        predictions: validatedData.predictions,
        season: validatedData.season,
      },
    })

    return {
      ...bet,
      predictions: predictionSchema.parse(bet.predictions),
    }
  } catch (error) {
    console.error('Create/update user bet error:', error)
    throw new Error('Failed to save user bet')
  }
}

// MARK: - Score
const getUserScore = async (
  userId: string
): Promise<UserScoreAPIResponse[]> => {
  try {
    const [brazilianLeague, rules, userBet] = await Promise.all([
      getBrazilianLeague(),
      getAllBetRules(),
      getUserBet(userId),
    ])

    if (!userBet) {
      throw new Error('User bet not found')
    }

    const predictions = predictionSchema.parse(userBet.predictions)
    return calculateScore(predictions, rules, brazilianLeague)
  } catch (error) {
    console.error('Get user score error:', error)
    throw new Error('Failed to calculate user score')
  }
}

export {
  createUser,
  createUserBet,
  existsUser,
  getAllBetRules,
  getUserBet,
  getUserById,
  getUserScore,
}
