import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  let year = new Date().getFullYear()
  const yearParam = searchParams.get('year')
  if (yearParam != null) {
    year = parseInt(yearParam)
  }

  try {
    const bet = await prisma.bet.findUnique({
      where: {
        userId_year: {
          userId: session.user.id,
          year,
        },
      },
    })

    return NextResponse.json({ bet })
  } catch (error) {
    return NextResponse.json(
      { error: 'Falha ao buscar aposta' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { predictions, year } = body

    const bet = await prisma.bet.upsert({
      where: {
        userId_year: {
          userId: session.user.id,
          year: year,
        },
      },
      update: {
        predictions,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        predictions,
        year: year,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Falha ao salvar aposta' },
      { status: 500 }
    )
  }
}
