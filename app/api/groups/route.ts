import { authOptions } from '@/lib/auth'
import {
  existsUser,
  getAllPublicGroups,
  getUserGroups,
} from '@/repositories/brazuerao.repository'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const publicGroups = await getAllPublicGroups()

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({
        public: publicGroups,
      })
    }

    const existingUser = await existsUser({ id: session.user.id })
    if (!existingUser) {
      throw new Error('User not found')
    }

    const userGroups = await getUserGroups(session.user.id)
    return Response.json({
      public: [
        ...userGroups.map((userGroup) => !userGroup.isPrivate),
        ...publicGroups.filter((group) =>
          userGroups.some((userGroup) => userGroup.groupId !== group.userId)
        ),
      ],
      private: [...userGroups.map((userGroup) => userGroup.isPrivate)],
    })
  } catch (error) {
    console.error('Error fetching user groups:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar grupos do usuário' },
      { status: 500 }
    )
  }
}
