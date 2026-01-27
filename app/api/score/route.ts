import { authOptions } from '@/lib/auth'
import { existsUser, getUserScore } from '@/repositories/brazuerao.repository'
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
      throw new Error('Usuário não encontrado')
    }

    const score = await getUserScore(session.user.id)
    return NextResponse.json({
      score: score.reduce((total, item) => total + item.score, 0),
      scoreByRule: score,
    })
  } catch (error) {
    console.error('Erro ao buscar classificação:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar classificação' },
      { status: 500 }
    )
  }
}
