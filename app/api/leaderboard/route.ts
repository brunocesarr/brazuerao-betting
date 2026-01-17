import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const year = parseInt(
    searchParams.get('year') || `${new Date().getFullYear()}`
  )

  try {
    const scores = await prisma.$queryRaw<
      {
        userId: number
        year: number
        correctGuesses: number
        username: string
      }[]
    >`
      SELECT s.id AS userId, s.year AS year, s.correctGuesses, u.name AS username
      FROM Score s
      INNER JOIN User u ON u.id = s.userId
      WHERE s.year = ${year}
      ORDER BY s.correctGuesses DESC
    `

    const leaderboard = scores.map((score) => ({
      userId: score.userId,
      userName: score.username,
      correctGuesses: score.correctGuesses,
      round: score.year,
    }))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Falha ao buscar classificação' },
      { status: 500 }
    )
  }
}
