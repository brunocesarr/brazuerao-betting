import { apiBrazuerao } from '@/repositories/apiBrazuerao'
import { UserScoreAPIResponse } from '@/types'

async function getIndividualUserScore(classification: string[]) {
  try {
    const { data: userScore } = await apiBrazuerao.post<UserScoreAPIResponse>(
      '/v1/bet-status',
      {
        bets: [
          {
            username: 'user',
            classification,
          },
        ],
      }
    )

    if (!userScore) return []

    return userScore
  } catch (error) {
    console.error(
      `Error in Brazuerao API. Erro message: ${(error as Error).message}`
    )
    const errorMessage = `Brazuerao API: ${(error as Error).message}`
    throw new Error(errorMessage)
  }
}

async function getBrazilianLeague(year?: number) {
  try {
    const { data: brasilianLeagueApiGE } = await apiBrazuerao.get<any[]>(
      '/v1/brazilian-league'
    )

    return brasilianLeagueApiGE.map((teamPositionInfo) => {
      const teamPositionApiInfo = {
        posicao: teamPositionInfo.position,
        jogos: teamPositionInfo.played,
        name: teamPositionInfo.team,
        logo: teamPositionInfo.shield,
      }

      return teamPositionApiInfo
    })
  } catch (error) {
    console.error(
      `Error in Brazuerao API. Erro message: ${(error as Error).message}`
    )
    const errorMessage = `Brazuerao API: ${(error as Error).message}`
    throw new Error(errorMessage)
  }
}

export { getIndividualUserScore, getBrazilianLeague }
