import { authOptions } from '@/lib/auth'
import {
  existsUser,
  getCurrentRequestsByGroupId,
  updateUserBetGroup,
} from '@/repositories/brazuerao.repository'
import { CurrentRequestBetGroupAPIResponse } from '@/types/api'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const existingUser = await existsUser({ id: session.user.id })
    if (!existingUser) {
      throw new Error('User not found')
    }

    const { groupId } = await params
    const currentRequests: CurrentRequestBetGroupAPIResponse[] =
      await getCurrentRequestsByGroupId(session.user.id, groupId)

    return Response.json({
      requests: currentRequests,
    })
  } catch (error) {
    console.error('Error fetching user groups:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar grupos do usuário' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const existingUser = await existsUser({ id: session.user.id })
    if (!existingUser) {
      throw new Error('User not found')
    }

    const { groupId } = await params
    const { userId, statusId } = await request.json()
    const userGroup = await updateUserBetGroup(
      session.user.id,
      userId,
      groupId,
      statusId
    )

    return NextResponse.json({
      request: userGroup,
    })
  } catch (error) {
    console.error('Error update user get group:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update bet group' },
      { status: 500 }
    )
  }
}
