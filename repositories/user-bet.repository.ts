import { predictionSchema, userBetPredictionsSchema } from '@/helpers/schemas'
import { prisma } from '@/lib/prisma'
import { UserBetDBModel } from '@/types/entities'

// MARK: - Bets
export const getUserBets = async (
  userId: string,
  season: number = new Date().getFullYear()
): Promise<UserBetDBModel[]> => {
  try {
    const bets = await prisma.bet.findMany({
      where: {
        userId,
        season: season,
      },
    })

    if (!bets) {
      return []
    }

    return bets.map((bet) => {
      return {
        ...bet,
        predictions: predictionSchema.parse(bet.predictions),
      }
    })
  } catch (error) {
    console.error('Get user bets error:', error)
    throw error
  }
}

export const getUserBetsByGroupId = async (
  groupId: string,
  season: number = new Date().getFullYear()
): Promise<UserBetDBModel[]> => {
  try {
    const bets = await prisma.bet.findMany({
      where: {
        season: season,
        groupId,
      },
    })

    if (!bets) {
      return []
    }

    return bets.map((bet) => {
      return {
        ...bet,
        predictions: predictionSchema.parse(bet.predictions),
      }
    })
  } catch (error) {
    console.error('Get user bets by groupId error:', error)
    throw error
  }
}

export const createUserBet = async (
  userId: string,
  predictions: string[],
  groupId: string | null,
  season: number = new Date().getFullYear()
): Promise<UserBetDBModel[]> => {
  try {
    const validatedData = userBetPredictionsSchema.parse({
      predictions,
      season,
    })
    const existingBets = await fetchUserBets(userId, validatedData.season)

    const updatedBets = await handleBetCreationOrUpdate(
      userId,
      groupId,
      validatedData,
      existingBets
    )

    return parseBetPredictions(updatedBets)
  } catch (error) {
    console.error('Create/update user bet error:', error)
    throw error
  }
}

export const updateGroupIdForDefaultUserBet = async (
  userId: string,
  groupId: string,
  season: number = new Date().getFullYear()
): Promise<UserBetDBModel[]> => {
  try {
    const existingBets = await fetchUserBets(userId, season)
    const defaultUserBet = existingBets.find((bet) => !bet.groupId)

    const updatedBet = await prisma.bet.update({
      where: {
        id: defaultUserBet?.id,
      },
      data: {
        groupId,
      },
    })

    return parseBetPredictions([updatedBet])
  } catch (error) {
    console.error('Update group id for user bet error:', error)
    throw error
  }
}

// Helper functions
const fetchUserBets = async (userId: string, season: number) => {
  return prisma.bet.findMany({
    where: { userId, season },
  })
}

const handleBetCreationOrUpdate = async (
  userId: string,
  groupId: string | null,
  validatedData: { predictions: string[]; season: number },
  existingBets: UserBetDBModel[]
): Promise<UserBetDBModel[]> => {
  if (existingBets.length === 0) {
    return [await createBet(userId, groupId, validatedData)]
  }

  if (groupId) {
    return [await handleGroupBet(userId, groupId, validatedData, existingBets)]
  }

  if (existingBets.length === 1 && !existingBets[0].groupId) {
    return [await createBet(userId, groupId, validatedData)]
  }

  return updateNonExpiredBets(existingBets, validatedData.predictions)
}

const createBet = async (
  userId: string,
  groupId: string | null,
  validatedData: { predictions: string[]; season: number }
) => {
  return prisma.bet.create({
    data: {
      userId,
      groupId,
      season: validatedData.season,
      predictions: validatedData.predictions,
    },
  })
}

const handleGroupBet = async (
  userId: string,
  groupId: string,
  validatedData: { predictions: string[]; season: number },
  existingBets: UserBetDBModel[]
): Promise<UserBetDBModel> => {
  await validateGroupDeadline(groupId)

  const existingBet = existingBets.find((bet) => bet.groupId === groupId)

  if (existingBet) {
    return updateBet(existingBet.id, validatedData.predictions)
  }

  return createBet(userId, groupId, validatedData)
}

const validateGroupDeadline = async (groupId: string) => {
  const { deadlineAt } = await prisma.betGroup.findFirstOrThrow({
    where: { id: groupId },
    select: { deadlineAt: true },
  })

  if (deadlineAt.getTime() <= new Date().getTime()) {
    throw new Error('Deadline date expired.')
  }
}

const updateBet = async (betId: string, predictions: string[]) => {
  return prisma.bet.update({
    where: { id: betId },
    data: {
      predictions,
      updatedAt: new Date(),
    },
  })
}

const updateNonExpiredBets = async (
  existingBets: UserBetDBModel[],
  predictions: string[]
): Promise<UserBetDBModel[]> => {
  const betsWithGroups = existingBets.filter((bet) => bet.groupId)
  const groupIds = betsWithGroups.map((bet) => bet.groupId as string)

  const betGroups = await prisma.betGroup.findMany({
    where: { id: { in: groupIds } },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  const nonExpiredGroupIds = betGroups
    .filter((group) => group.deadlineAt.getTime() > new Date().getTime())
    .map((group) => group.id)

  return prisma.bet.updateManyAndReturn({
    where: { id: { in: nonExpiredGroupIds } },
    data: {
      predictions,
      updatedAt: new Date(),
    },
  })
}

const parseBetPredictions = (bets: UserBetDBModel[]): UserBetDBModel[] => {
  return bets.map((bet) => ({
    ...bet,
    predictions: predictionSchema.parse(bet.predictions),
  }))
}
