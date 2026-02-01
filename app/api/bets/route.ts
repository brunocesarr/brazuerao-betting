import { authOptions } from '@/lib/auth'
import {
  createUserBet,
  existsUser,
  getUserBets,
} from '@/repositories/brazuerao.repository'
import { updateGroupIdForDefaultUserBet } from '@/repositories/user-bet.repository'
import { UserBetAPIResponse } from '@/types/api'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    let season = new Date().getFullYear()
    const seasonParam = searchParams.get('season')
    if (seasonParam != null) {
      season = parseInt(seasonParam)
    }

    const existingUser = await existsUser({ id: session.user.id })
    if (!existingUser) {
      throw new Error('Usuário não encontrado')
    }

    const bets = await getUserBets(session.user.id, season)
    return NextResponse.json({ bets: bets as UserBetAPIResponse[] })
  } catch (error) {
    console.error('Erro ao obter aposta:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar aposta' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { predictions, season, groupId } = body

    const existingUser = await existsUser({ id: session.user.id })
    if (!existingUser) {
      throw new Error('Usuário não encontrado')
    }

    const bet = await createUserBet(
      session.user.id,
      predictions,
      groupId,
      season
    )
    return NextResponse.json({ bet })
  } catch (error) {
    console.error('Erro ao salvar aposta:', error)
    return NextResponse.json(
      { error: 'Falha ao salvar aposta' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { season, groupId } = body

    const existingUser = await existsUser({ id: session.user.id })
    if (!existingUser) {
      throw new Error('Usuário não encontrado')
    }

    const bet = await updateGroupIdForDefaultUserBet(
      session.user.id,
      groupId,
      season
    )
    return NextResponse.json({ bet })
  } catch (error) {
    console.error('Erro ao atualizar a aposta:', error)
    return NextResponse.json(
      { error: 'Falha ao atualizar a aposta' },
      { status: 500 }
    )
  }
}
