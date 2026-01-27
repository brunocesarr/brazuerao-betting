import { getAllRequestStatus } from '@/repositories/brazuerao.repository'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestStatus = await getAllRequestStatus()
    return Response.json({
      requestStatus,
    })
  } catch (error) {
    console.error('Erro ao buscar status da solicitação:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar status da solicitação' },
      { status: 500 }
    )
  }
}
