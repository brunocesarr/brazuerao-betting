import { getBrazilianLeague } from '@/services/brazuerao.service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = Number(
      searchParams.get('year') ?? `${new Date().getFullYear()}`
    )

    if (year > new Date().getFullYear())
      return NextResponse.json(
        { message: 'Parâmetro inválido: ano' },
        { status: 400 }
      )

    if (year == new Date().getFullYear()) {
      const data = await getBrazilianLeague()
      return Response.json(data)
    } else {
      return NextResponse.json(
        { message: 'Dados para o ano solicitado não estão disponíveis' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Erro ao buscar classificação:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar classificação' },
      { status: 500 }
    )
  }
}
