import { DefaultValues, RequestStatusEnum } from '@/helpers/constants'
import { predictionSchema, userBetPredictionsSchema } from '@/helpers/schemas'
import { prisma } from '@/lib/prisma'
import { getBrazilianLeague } from '@/services/brazuerao.service'
import { calculateScore } from '@/services/scoring.service'
import { UserProfile } from '@/types'
import { UserScoreAPIResponse } from '@/types/api'
import { UserBetGroup } from '@/types/domain'
import { BetRuleDBModel, UserBetDBModel } from '@/types/entities'
import { hash } from 'bcryptjs'

// MARK: - Group Role
const getAllGroupRoles = async () => {
  try {
    if (DefaultValues.groupRoles.length > 0) {
      DefaultValues.adminGroupRule = DefaultValues.groupRoles.find(
        (rule) => rule.name.toUpperCase() === 'ADMIN'
      )
      return DefaultValues.groupRoles
    }
    const roles = await prisma.roleGroup.findMany()
    DefaultValues.groupRoles = roles
    DefaultValues.adminGroupRule = roles.find(
      (rule) => rule.name.toUpperCase() === 'ADMIN'
    )
    return roles
  } catch (error) {
    console.error('Get roles error:', error)
    return []
  }
}

// MARK: - Request Status
const getAllRequestStatus = async () => {
  try {
    if (DefaultValues.requestStatus.length > 0) {
      DefaultValues.pendingRequestStatus = DefaultValues.requestStatus.find(
        (status) => status.status === RequestStatusEnum.pending
      )
      DefaultValues.approvedRequestStatus = DefaultValues.requestStatus.find(
        (status) => status.status === RequestStatusEnum.approved
      )
      return DefaultValues.requestStatus
    }
    const requestStatus = await prisma.requestStatus.findMany()
    const formattedValues = requestStatus.map((item) => {
      let status: RequestStatusEnum = RequestStatusEnum.rejected
      if (
        Object.values(RequestStatusEnum).includes(
          item.status as RequestStatusEnum
        )
      ) {
        status = item.status as RequestStatusEnum
      }
      return {
        ...item,
        status,
      }
    })
    DefaultValues.requestStatus = formattedValues
    DefaultValues.pendingRequestStatus = formattedValues.find(
      (status) => status.status === RequestStatusEnum.pending
    )
    DefaultValues.approvedRequestStatus = formattedValues.find(
      (status) => status.status === RequestStatusEnum.approved
    )
    return formattedValues
  } catch (error) {
    console.error('Get request status error:', error)
    return []
  }
}

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

// MARK: - Groups
const getAllGroups = async (): Promise<UserBetGroup[]> => {
  try {
    const groups = await prisma.betGroup.findMany()

    return groups.map((group) => {
      return {
        groupId: group.id,
        name: group.name,
        challenge: group.challenge,
        isPrivate: group.isPrivate,
        allowPublicViewing: group.allowPublicViewing,
      }
    })
  } catch (error) {
    console.error('Get public groups error:', error)
    throw new Error('Failed to get public groups')
  }
}

const getUserGroups = async (userId: string): Promise<UserBetGroup[]> => {
  try {
    const userGroupRelations = await prisma.userBetGroup.findMany({
      where: {
        userId: userId,
      },
    })
    const groups = await prisma.betGroup.findMany({
      where: {
        id: {
          in: userGroupRelations.map((relation) => relation.groupId),
        },
      },
    })

    return userGroupRelations
      .map((relation) => {
        const group = groups.find((group) => group.id === relation.groupId)
        if (!group) return null
        return {
          groupId: relation.groupId,
          name: group.name,
          challenge: group.challenge,
          isPrivate: group.isPrivate,
          allowPublicViewing: group.allowPublicViewing,
          userId: relation.userId,
          roleGroupId: relation.roleGroupId,
          requestStatusId: relation.requestStatusId,
        }
      })
      .filter((userGroup) => userGroup != null)
  } catch (error) {
    console.error('Get user groups error:', error)
    throw new Error('Failed to get user groups')
  }
}

const createNewBetGroup = async (
  userId: string,
  name: string,
  challenge: string | undefined,
  isPrivate: boolean,
  allowPublicViewing: boolean,
  rules: string[]
) => {
  try {
    const [newGroup, adminRole, approvedRequestStatus] = await Promise.all([
      prisma.betGroup.create({
        data: {
          name,
          challenge,
          isPrivate,
          allowPublicViewing,
        },
      }),
      prisma.roleGroup.findFirstOrThrow({
        where: { name: 'ADMIN' },
      }),
      prisma.requestStatus.findFirstOrThrow({
        where: { status: 'APPROVED' },
      }),
    ])
    Promise.all(
      rules.map((rule) =>
        prisma.scoringRuleBetGroup.create({
          data: {
            ruleId: rule,
            groupId: newGroup.id,
          },
        })
      )
    )

    const userBetGroup = await prisma.userBetGroup.create({
      data: {
        groupId: newGroup.id,
        userId: userId,
        requestStatusId: approvedRequestStatus.id,
        roleGroupId: adminRole.id,
      },
    })

    return {
      groupId: newGroup.id,
      name: newGroup.name,
      challenge: newGroup.challenge,
      isPrivate: newGroup.isPrivate,
      allowPublicViewing: newGroup.allowPublicViewing,
      userId: userBetGroup.userId,
      roleGroupId: userBetGroup.roleGroupId,
      requestStatusId: userBetGroup.requestStatusId,
    }
  } catch (error) {
    console.error('Create group error:', error)
    throw new Error('Failed to create group')
  }
}

const deleteBetGroup = async (userId: string, groupId: string) => {
  try {
    await prisma.betGroup.delete({
      where: {
        id: groupId,
      },
    })
  } catch (error) {
    console.error('Delete group error:', error)
    throw new Error('Failed to delete group')
  }
}

const joinBetGroup = async (userId: string, groupId: string) => {
  try {
    const [group, userRole, pendingRequestStatus] = await Promise.all([
      prisma.betGroup.findFirstOrThrow({
        where: {
          id: groupId,
        },
      }),
      prisma.roleGroup.findFirstOrThrow({
        where: { name: 'USER' },
      }),
      prisma.requestStatus.findFirstOrThrow({
        where: { status: 'PENDING' },
      }),
    ])

    const userBetGroup = await prisma.userBetGroup.create({
      data: {
        groupId: group.id,
        userId: userId,
        requestStatusId: pendingRequestStatus.id,
        roleGroupId: userRole.id,
      },
    })

    return {
      groupId: group.id,
      name: group.name,
      challenge: group.challenge,
      isPrivate: group.isPrivate,
      allowPublicViewing: group.allowPublicViewing,
      userId: userBetGroup.userId,
      roleGroupId: userBetGroup.roleGroupId,
      requestStatusId: userBetGroup.requestStatusId,
    }
  } catch (error) {
    console.error('Joining group error:', error)
    throw new Error('Failed to join group')
  }
}

const unfollowBetGroup = async (userId: string, groupId: string) => {
  try {
    await prisma.userBetGroup.delete({
      where: {
        groupId_userId: {
          userId: userId,
          groupId: groupId,
        },
      },
    })
  } catch (error) {
    console.error('Unfollowing group error:', error)
    throw new Error('Failed to unfollow group')
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
  getUserBet,
  getUserById,
  getUserGroups,
  getUserScore,
  joinBetGroup,
  unfollowBetGroup,
}
