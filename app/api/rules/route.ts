import { getAllBetRules } from '@/repositories/brazuerao.repository'
import { RulesAPIResponse } from '@/types/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const rules = await getAllBetRules()
    return NextResponse.json({ rules: rules as RulesAPIResponse[] })
  } catch (error) {
    console.error('Erro ao buscar regras de aposta:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar regras' },
      { status: 500 }
    )
  }
}
