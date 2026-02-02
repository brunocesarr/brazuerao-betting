import { authOptions } from '@/lib/auth'
import {
  createNewBetGroup,
  existsUser,
  getUserGroups,
} from '@/repositories/brazuerao.repository'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const existingUser = await existsUser({ id: session.user.id })
    if (!existingUser) {
      throw new Error('Usuário não encontrado')
    }

    const userGroups = await getUserGroups(session.user.id)
    return Response.json({
      groups: userGroups,
    })
  } catch (error) {
    console.error('Erro ao buscar grupos do usuário:', error)
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
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const existingUser = await existsUser({ id: session.user.id })
    if (!existingUser) {
      throw new Error('Usuário não encontrado')
    }

    const {
      name,
      challenge,
      isPrivate,
      deadlineAt,
      allowPublicViewing,
      rules,
    } = await request.json()

    const newUserGroup = await createNewBetGroup(
      session.user.id,
      name,
      challenge,
      isPrivate,
      deadlineAt,
      allowPublicViewing,
      rules
    )
    return NextResponse.json(newUserGroup)
  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json({ error: 'Falha no registro' }, { status: 500 })
  }
}
