import { getAllGroupRoles } from '@/repositories/brazuerao.repository'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const roles = await getAllGroupRoles()
    return Response.json({
      roles,
    })
  } catch (error) {
    console.error('Erro ao buscar funções:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar funções' },
      { status: 500 }
    )
  }
}
