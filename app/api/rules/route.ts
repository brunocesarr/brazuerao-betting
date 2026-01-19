import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const rules = await prisma.scoringRule.findMany({
      where: {
        isActive: true,
      },
    })
    const formattedRules = rules.map((rule) => ({
      ...rule,
      ranges:
        typeof rule.ranges === 'string' ? JSON.parse(rule.ranges) : rule.ranges,
    }))

    return NextResponse.json({ rules: formattedRules })
  } catch (error) {
    console.error('Error fetching bet rules:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar regras' },
      { status: 500 }
    )
  }
}
