import { authOptions } from '@/lib/auth'
import { existsUser, getAllGroups } from '@/repositories/brazuerao.repository'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const allGroups = await getAllGroups()

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({
        groups: allGroups
          .filter((group) => !group.isPrivate)
          .filter((group) => group.allowPublicViewing),
      })
    }

    const existingUser = await existsUser({ id: session.user.id })
    if (!existingUser) {
      throw new Error('User not found')
    }

    return Response.json({
      groups: allGroups,
    })
  } catch (error) {
    console.error('Error fetching user groups:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar grupos do usuário' },
      { status: 500 }
    )
  }
}
