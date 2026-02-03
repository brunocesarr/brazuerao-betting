import { authOptions } from '@/lib/auth'
import {
  deleteBetGroup,
  existsUser,
  getAllGroupRoles,
  getUserGroups,
  joinBetGroup,
  unfollowBetGroup,
} from '@/repositories/brazuerao.repository'
import { updateBetGroup } from '@/repositories/user-bet-group.repository'
import { UserBetGroup } from '@/types/domain'
import { RoleGroupDBModel } from '@/types/entities'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
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
      throw new Error('Usuário não encontrado')
    }

    const { groupId } = await params

    const [roles, groups] = await Promise.all([
      getAllGroupRoles(),
      getUserGroups(session.user.id),
    ])
    const adminRole = roles.find(
      (role: RoleGroupDBModel) => role.name.toUpperCase() === 'ADMIN'
    )

    if (
      groups.some(
        (group: UserBetGroup) =>
          group.groupId === groupId && group.roleGroupId === adminRole?.id
      )
    ) {
      await deleteBetGroup(session.user.id, groupId)
    } else {
      await unfollowBetGroup(session.user.id, groupId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar grupo:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao deletar grupo' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const existingUser = await existsUser({ id: session.user.id })
    if (!existingUser) {
      throw new Error('Usuário não encontrado')
    }

    const { groupId } = await params
    const userGroup = await joinBetGroup(session.user.id, groupId)

    return NextResponse.json(userGroup)
  } catch (error) {
    console.error('Erro ao entrar no grupo:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao entrar no grupo' },
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
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const existingUser = await existsUser({ id: session.user.id })
    if (!existingUser) {
      throw new Error('Usuário não encontrado')
    }

    const { groupId } = await params
    const { name, challenge, isPrivate, deadlineAt, allowPublicViewing } =
      await request.json()

    const newUserGroup = await updateBetGroup(
      session.user.id,
      groupId,
      name,
      challenge,
      isPrivate,
      deadlineAt,
      allowPublicViewing
    )
    return NextResponse.json(newUserGroup)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: 'Falha na atualizacão' }, { status: 500 })
  }
}
