import { prisma } from '@/lib/prisma'
import { UserBetGroup } from '@/types/domain'

// MARK: - Groups
export const getAllGroups = async (): Promise<UserBetGroup[]> => {
  try {
    const groups = await prisma.betGroup.findMany()

    return groups.map((group) => {
      return {
        groupId: group.id,
        name: group.name,
        challenge: group.challenge,
        isPrivate: group.isPrivate,
        deadlineAt: group.deadlineAt,
        allowPublicViewing: group.allowPublicViewing,
      }
    })
  } catch (error) {
    console.error('Get public groups error:', error)
    throw error
  }
}

export const getUserGroups = async (
  userId: string
): Promise<UserBetGroup[]> => {
  try {
    const userGroupRelations = await prisma.userBetGroup.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: 'desc',
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
          deadlineAt: group.deadlineAt,
          allowPublicViewing: group.allowPublicViewing,
          userId: relation.userId,
          roleGroupId: relation.roleGroupId,
          requestStatusId: relation.requestStatusId,
        }
      })
      .filter((userGroup) => userGroup != null)
  } catch (error) {
    console.error('Get user groups error:', error)
    throw error
  }
}

export const updateBetGroup = async (
  userId: string,
  groupId: string,
  name: string,
  challenge: string | undefined,
  isPrivate: boolean,
  deadlineAt: Date,
  allowPublicViewing: boolean
) => {
  try {
    const [adminRole, userGroupRelation] = await Promise.all([
      prisma.roleGroup.findFirstOrThrow({
        where: { name: 'ADMIN' },
      }),
      prisma.userBetGroup.findFirstOrThrow({
        where: {
          groupId: groupId,
          userId: userId,
        },
      }),
    ])

    if (!(userGroupRelation.roleGroupId === adminRole.id)) {
      throw new Error('Insufficient role')
    }

    const updatedBetGroup = await prisma.betGroup.update({
      where: {
        id: userGroupRelation.groupId,
      },
      data: {
        name,
        challenge,
        deadlineAt,
        isPrivate,
        allowPublicViewing,
        updatedAt: new Date(),
      },
    })

    return {
      groupId: updatedBetGroup.id,
      name: updatedBetGroup.name,
      challenge: updatedBetGroup.challenge,
      isPrivate: updatedBetGroup.isPrivate,
      deadlineAt: updatedBetGroup.deadlineAt,
      allowPublicViewing: updatedBetGroup.allowPublicViewing,
      userId: userGroupRelation.userId,
      roleGroupId: userGroupRelation.roleGroupId,
      requestStatusId: userGroupRelation.requestStatusId,
    }
  } catch (error) {
    console.error('Update group error:', error)
    throw error
  }
}

export const createNewBetGroup = async (
  userId: string,
  name: string,
  challenge: string | undefined,
  isPrivate: boolean,
  deadlineAt: Date,
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
          deadlineAt,
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
      deadlineAt: newGroup.deadlineAt,
      allowPublicViewing: newGroup.allowPublicViewing,
      userId: userBetGroup.userId,
      roleGroupId: userBetGroup.roleGroupId,
      requestStatusId: userBetGroup.requestStatusId,
    }
  } catch (error) {
    console.error('Create group error:', error)
    throw error
  }
}

export const deleteBetGroup = async (userId: string, groupId: string) => {
  try {
    await prisma.betGroup.delete({
      where: {
        id: groupId,
      },
    })
  } catch (error) {
    console.error('Delete group error:', error)
    throw error
  }
}

export const joinBetGroup = async (userId: string, groupId: string) => {
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
    throw error
  }
}

export const unfollowBetGroup = async (userId: string, groupId: string) => {
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
    throw error
  }
}
