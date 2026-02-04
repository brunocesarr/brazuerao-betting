import { predictionSchema } from '@/helpers/schemas'
import { prisma } from '@/lib/prisma'
import {
  getAllRequestStatus,
  getCurrentRequestsByGroupId,
  updateRequestStatus,
} from '@/repositories/request-status.repository'
import { getAllGroupRoles } from '@/repositories/roles-repository'
import {
  getAllBetRules,
  getAllBetRulesByGroupId,
} from '@/repositories/rules.repository'
import {
  createNewBetGroup,
  deleteBetGroup,
  getAllGroups,
  getUserGroups,
  joinBetGroup,
  unfollowBetGroup,
} from '@/repositories/user-bet-group.repository'
import {
  createUserBet,
  getUserBets,
  getUserBetsByGroupId,
} from '@/repositories/user-bet.repository'
import {
  createUser,
  existsUser,
  getUserById,
} from '@/repositories/user.repository'
import { getBrazilianLeagueByGloboEsporte } from '@/services/brazuerao.service'
import { calculateScore } from '@/services/scoring.service'
import { ScoreEntryAPIResponse } from '@/types/api'

// MARK: - Score
const getUserScore = async (
  userId: string
): Promise<{ groupId: string | null; score: ScoreEntryAPIResponse[] }[]> => {
  try {
    const userBets = await getUserBets(userId)

    if (!userBets) {
      throw new Error('Empty user bets.')
    }

    const [brazilianLeague, rules] = await Promise.all([
      getBrazilianLeagueByGloboEsporte(),
      getAllBetRules(),
    ])

    return userBets.map((userBet) => {
      const predictions = predictionSchema.parse(userBet.predictions)
      return {
        groupId: userBet.groupId,
        score: calculateScore(predictions, rules, brazilianLeague),
      }
    })
  } catch (error) {
    console.error('Get user score error:', error)
    throw error
  }
}

const getLeaderboard = async (groupId: string, season: number) => {
  try {
    const userBets = await getUserBetsByGroupId(groupId, season)

    if (userBets.length === 0) {
      return []
    }

    const [brazilianLeague, rules, userInfos] = await Promise.all([
      getBrazilianLeagueByGloboEsporte(),
      getAllBetRulesByGroupId(groupId),
      prisma.user.findMany({
        where: { id: { in: userBets.map((userBet) => userBet.userId) } },
      }),
    ])

    return userBets
      .map((userBet) => {
        const predictions = predictionSchema.parse(userBet.predictions)
        const score = calculateScore(predictions, rules, brazilianLeague)
        const userInfo = userInfos.find((info) => info.id === userBet.userId)
        if (!userInfo) return null
        return {
          userId: userInfo.id,
          username: userInfo?.name,
          groupId: userBet.groupId,
          predictions,
          totalScore: score.reduce((total, item) => total + item.score, 0),
          score,
        }
      })
      .filter((userBet) => userBet)
  } catch (error) {
    console.error('Get group score error:', error)
    throw error
  }
}

export {
  createNewBetGroup,
  createUser,
  createUserBet,
  deleteBetGroup,
  existsUser,
  getAllBetRules,
  getAllGroupRoles,
  getAllGroups,
  getAllRequestStatus,
  getCurrentRequestsByGroupId,
  getLeaderboard,
  getUserBets,
  getUserById,
  getUserGroups,
  getUserScore,
  joinBetGroup,
  unfollowBetGroup,
  updateRequestStatus as updateUserBetGroup,
}
