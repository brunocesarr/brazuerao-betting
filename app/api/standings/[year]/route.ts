import { getSeasonIdByYear } from '@/lib/sofascore'
import { NextResponse } from 'next/server'

const URL_BASE_SOFASCORE =
  process.env.NEXT_PUBLIC_SOFASCORE_API_URL || 'https://api.sofascore.com/api'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

async function fetchSofaScore(endpoint: string) {
  const response = await fetch(`${URL_BASE_SOFASCORE}${endpoint}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
      'sec-ch-ua':
        '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ year: string }> }
) {
  try {
    const { year } = await params
    const yearNumber = parseInt(year)

    if (
      isNaN(yearNumber) ||
      yearNumber < 2003 ||
      yearNumber > new Date().getFullYear()
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid year parameter' },
        { status: 400 }
      )
    }

    const seasonId = await getSeasonIdByYear(yearNumber)

    if (!seasonId) {
      return NextResponse.json(
        { success: false, error: `No data available for year ${yearNumber}` },
        { status: 404 }
      )
    }

    const data = await fetchSofaScore(
      `/v1/unique-tournament/325/season/${seasonId}/standings/total`
    )

    const standings = data.standings[0].rows.map(
      (
        team: {
          team: {
            name: string
            id: number
            shortName: string
          }
          matches: number
          wins: number
          draws: number
          losses: number
          scoresFor: number
          scoresAgainst: number
          points: number
        },
        index: number
      ) => ({
        position: index + 1,
        team: team.team.name,
        teamId: team.team.id,
        teamShortName: team.team.shortName,
        played: team.matches,
        wins: team.wins,
        draws: team.draws,
        losses: team.losses,
        goalsFor: team.scoresFor,
        goalsAgainst: team.scoresAgainst,
        goalDifference: team.scoresFor - team.scoresAgainst,
        points: team.points,
        shield: getTeamLogoUrl(team.team.id),
      })
    )

    return NextResponse.json(
      {
        success: true,
        year,
        seasonId,
        data: standings,
        lastUpdated: new Date().toISOString(),
      },
      {
        headers: {
          'Access-Control-Allow-Origin': 'https://brazuerao-betting.vercel.app',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching standings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch standings' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://brazuerao-betting.vercel.app',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

function getTeamLogoUrl(teamId: number): string {
  return `https://api.sofascore.com/api/v1/team/${teamId}/image`
}
