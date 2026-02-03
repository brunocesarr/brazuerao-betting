import { predictionSchema, userBetPredictionsSchema } from '@/helpers/schemas'
import { prisma } from '@/lib/prisma'
import { getUserGroups } from '@/repositories/user-bet-group.repository'
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

  return updateAndCreateNonExpiredBets(
    userId,
    validatedData.season,
    existingBets,
    validatedData.predictions
  )
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

  const defaultBet = existingBets.find((bet) => !bet.groupId)
  if (defaultBet) {
    await prisma.bet.delete({ where: { id: defaultBet.id } })
  }

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

const updateAndCreateNonExpiredBets = async (
  userId: string,
  season: number,
  existingBets: UserBetDBModel[],
  predictions: string[]
): Promise<UserBetDBModel[]> => {
  const groups = await getUserGroups(userId)

  const nonExpiredGroupIds = groups
    .filter((group) => group.deadlineAt.getTime() > new Date().getTime())
    .map((group) => group.groupId)

  if (nonExpiredGroupIds.length === 0) {
    throw new Error('Deadline date expired.')
  }

  const defaultBet = existingBets.find((bet) => !bet.groupId)
  if (defaultBet) {
    await prisma.bet.delete({ where: { id: defaultBet.id } })
  }

  const groupsWithBet = existingBets
    .filter((bet) => bet.groupId && nonExpiredGroupIds.includes(bet.groupId))
    .map((bet) => bet.id)

  const groupsWithoutBet = nonExpiredGroupIds.filter(
    (groupId) => !groupsWithBet.includes(groupId)
  )

  const [updatedBets, createdBets] = await Promise.all([
    prisma.bet.updateManyAndReturn({
      where: { id: { in: groupsWithBet } },
      data: {
        predictions,
        updatedAt: new Date(),
      },
    }),
    prisma.bet.createManyAndReturn({
      data: groupsWithoutBet.map((groupId) => {
        return {
          userId,
          groupId,
          season,
          predictions,
        }
      }),
    }),
  ])

  return [...updatedBets, ...createdBets]
}

const parseBetPredictions = (bets: UserBetDBModel[]): UserBetDBModel[] => {
  return bets.map((bet) => ({
    ...bet,
    predictions: predictionSchema.parse(bet.predictions),
  }))
}
