import { DefaultValues, RequestStatusEnum } from '@/helpers/constants'
import { prisma } from '@/lib/prisma'
import { unfollowBetGroup } from '@/repositories/user-bet-group.repository'
import { getUserById } from '@/repositories/user.repository'
import { CurrentRequestBetGroup, RequestStatus } from '@/types/domain'

// MARK: - Request Status
export const getAllRequestStatus = async () => {
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

export const getCurrentRequestsByGroupId = async (
  userId: string,
  groupId: string
) => {
  try {
    const [adminRole, userGroupRelations] = await Promise.all([
      prisma.roleGroup.findFirstOrThrow({
        where: { name: 'ADMIN' },
      }),
      prisma.userBetGroup.findMany({
        where: {
          groupId: groupId,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
    ])

    if (
      !userGroupRelations.some(
        (relation) =>
          relation.userId === userId && relation.roleGroupId === adminRole.id
      )
    ) {
      throw new Error('Insufficient role')
    }

    const [requestStatus, userInfos] = await Promise.all([
      getAllRequestStatus(),
      prisma.user.findMany({
        where: {
          id: {
            in: userGroupRelations.map((relation) => relation.userId),
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
    ])

    return userGroupRelations.map((relation) => {
      const userInfo = userInfos.find((user) => user.id === relation.userId)
      const status = requestStatus.find(
        (option) => option.id === relation.requestStatusId
      )?.status
      return {
        groupId: relation.groupId,
        userId: relation.userId,
        username: userInfo?.name,
        email: userInfo?.email,
        requestStatusId: relation.requestStatusId,
        requestStatusDescription: status,
        createdAt: relation.createdAt,
      } as CurrentRequestBetGroup
    })
  } catch (error) {
    console.error('Get current requests error:', error)
    throw error
  }
}

export const updateRequestStatus = async (
  adminUserId: string,
  userId: string,
  groupId: string,
  statusId: string
) => {
  try {
    const adminRole = await prisma.roleGroup.findFirstOrThrow({
      where: { name: 'ADMIN' },
    })
    await prisma.userBetGroup.findFirstOrThrow({
      where: {
        userId: adminUserId,
        groupId: groupId,
        roleGroupId: adminRole.id,
      },
    })

    const [userInfo, requestStatus] = await Promise.all([
      getUserById(userId),
      getAllRequestStatus(),
    ])

    if (
      requestStatus.find((status: RequestStatus) => status.id === statusId)
        ?.status === RequestStatusEnum.rejected
    ) {
      return unfollowBetGroup(userId, groupId)
    }
    const updatedUserBetGroup = await prisma.userBetGroup.update({
      where: {
        userId: userId,
        groupId: groupId,
        groupId_userId: {
          userId: userId,
          groupId: groupId,
        },
      },
      data: {
        requestStatusId: statusId,
      },
    })

    return {
      groupId: updatedUserBetGroup.groupId,
      userId: updatedUserBetGroup.userId,
      username: userInfo?.name,
      email: userInfo?.email,
      requestStatusId: updatedUserBetGroup.requestStatusId,
      requestStatusDescription: requestStatus.find(
        (status: RequestStatus) => status.id === statusId
      )?.status,
      createdAt: updatedUserBetGroup.createdAt,
    } as CurrentRequestBetGroup
  } catch (error) {
    console.error('Unfollowing group error:', error)
    throw error
  }
}
