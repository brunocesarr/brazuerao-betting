import { authOptions } from '@/lib/auth'
import {
  createNewBetGroup,
  existsUser,
  getUserGroups,
} from '@/repositories/brazuerao.repository'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const existingUser = await existsUser({ id: session.user.id })
    if (!existingUser) {
      throw new Error('User not found')
    }

    const userGroups = await getUserGroups(session.user.id)
    return Response.json({
      groups: userGroups,
    })
  } catch (error) {
    console.error('Error fetching user groups:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar grupos do usuário' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { name, challenge, isPrivate, allowPublicViewing, rules } =
      await request.json()

    const newUserGroup = await createNewBetGroup(
      session.user.id,
      name,
      challenge,
      isPrivate,
      allowPublicViewing,
      rules
    )
    return NextResponse.json(newUserGroup)
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Falha no registro' }, { status: 500 })
  }
}
