import { authOptions } from '@/lib/auth'
import {
  getAllPublicUserGroups,
  getUserGroups,
} from '@/repositories/user-bet-group.repository'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const publicGroups = await getAllPublicUserGroups()

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ groups: publicGroups })
    }

    const userGroups = await getUserGroups(session.user.id)

    return NextResponse.json({
      groups: [
        ...userGroups,
        ...publicGroups.filter(
          (group) => !userGroups.some((userGroup) => userGroup.groupId)
        ),
      ],
    })
  } catch (error) {
    console.error('Erro ao buscar grupos para classificação:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar grupos para classificação' },
      { status: 500 }
    )
  }
}
