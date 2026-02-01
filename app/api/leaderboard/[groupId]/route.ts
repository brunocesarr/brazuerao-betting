import { getLeaderboard } from '@/repositories/brazuerao.repository'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    let season = new Date().getFullYear()
    const seasonParam = searchParams.get('season')
    if (seasonParam != null) {
      season = parseInt(seasonParam)
    }
    const { groupId } = await params

    const scores = await getLeaderboard(groupId, season)
    return NextResponse.json(scores)
  } catch (error) {
    console.error('Erro ao buscar classificacão do grupo:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar classificacão do grupo' },
      { status: 500 }
    )
  }
}
