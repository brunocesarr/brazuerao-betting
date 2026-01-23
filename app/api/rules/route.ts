import { getAllBetRules } from '@/repositories/brazuerao.repository'
import { RulesAPIResponse } from '@/types/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const rules = await getAllBetRules()
    return NextResponse.json({ rules: rules as RulesAPIResponse[] })
  } catch (error) {
    console.error('Error fetching bet rules:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar regras' },
      { status: 500 }
    )
  }
}
