import { predictionSchema } from '@/helpers/schemas'
import {
  getAllRequestStatus,
  getCurrentRequestsByGroupId,
  updateRequestStatus,
} from '@/repositories/request-status.repository'
import { getAllGroupRoles } from '@/repositories/roles-repository'
import { getAllBetRules } from '@/repositories/rules.repository'
import {
  createNewBetGroup,
  deleteBetGroup,
  getAllGroups,
  getUserGroups,
  joinBetGroup,
  unfollowBetGroup,
} from '@/repositories/user-bet-group.repository'
import { createUserBet, getUserBets } from '@/repositories/user-bet.repository'
import {
  createUser,
  existsUser,
  getUserById,
} from '@/repositories/user.repository'
import { getBrazilianLeague } from '@/services/brazuerao.service'
import { calculateScore } from '@/services/scoring.service'
import { UserScoreAPIResponse } from '@/types/api'

// MARK: - Score
const getUserScore = async (
  userId: string
): Promise<{ groupId: string | null; score: UserScoreAPIResponse[] }[]> => {
  try {
    const userBets = await getUserBets(userId)

    if (!userBets) {
      throw new Error('Empty user bets.')
    }

    const [brazilianLeague, rules] = await Promise.all([
      getBrazilianLeague(),
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
  getUserBets,
  getUserById,
  getUserGroups,
  getUserScore,
  joinBetGroup,
  unfollowBetGroup,
  updateRequestStatus as updateUserBetGroup,
}
