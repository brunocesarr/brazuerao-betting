import { getSeasonIdByYear } from '@/lib/sofascore'
import axios, { AxiosRequestConfig } from 'axios'
import { NextResponse } from 'next/server'

const URL_BASE_SOFASCORE = 'https://api.sofascore.com/api'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9'

const defaultOptions: AxiosRequestConfig = {
  baseURL: URL_BASE_SOFASCORE,
  headers: {
    'Content-Type': 'application/json',
  },
}

const apiSofaScore = axios.create(defaultOptions)

apiSofaScore.interceptors.request.use(
  function (config) {
    config.headers['User-Agent'] = USER_AGENT
    return config
  },
  function (error) {
    console.error(JSON.stringify(error))
    return Promise.reject(error)
  }
)

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

    const { data } = await apiSofaScore.get(
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

    return NextResponse.json({
      success: true,
      year,
      seasonId,
      data: standings,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching standings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch standings' },
      { status: 500 }
    )
  }
}

// Handle preflight OPTIONS request
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://api.sofascore.com',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

function getTeamLogoUrl(teamId: number): string {
  return `https://api.sofascore.com/api/v1/team/${teamId}/image`
}
