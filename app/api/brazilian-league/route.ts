import { getBrazilianLeagueByGloboEsporte } from '@/services/brazuerao.service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const data = await getBrazilianLeagueByGloboEsporte()
    return Response.json(data)
  } catch (error) {
    console.error('Erro ao buscar classificação:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar classificação' },
      { status: 500 }
    )
  }
}
