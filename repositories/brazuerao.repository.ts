import { apiBrazuerao, appBrazuerao } from '@/repositories/apiBrazuerao'
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
    const {
      data: { data: table },
    } = await appBrazuerao.get(`/standings/${year ?? new Date().getFullYear()}`)

    return table.map((teamPositionInfo: any) => {
      const teamPositionApiInfo = {
        position: teamPositionInfo.position,
        played: teamPositionInfo.played,
        name: teamPositionInfo.team,
        shield: teamPositionInfo.shield,
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

async function getAllBetRules() {
  try {
    const {
      data: { rules },
    } = await appBrazuerao.get('/rules')
    return rules
  } catch (error) {
    console.error(
      `Error in Brazuerao API. Erro message: ${(error as Error).message}`
    )
    const errorMessage = `Brazuerao API: ${(error as Error).message}`
    throw new Error(errorMessage)
  }
}

async function getBetByUserId() {
  try {
    const {
      data: { bet },
    } = await appBrazuerao.get(`/bets`)
    return bet
  } catch (error) {
    console.error(
      `Error in Brazuerao API. Erro message: ${(error as Error).message}`
    )
    const errorMessage = `Brazuerao API: ${(error as Error).message}`
    throw new Error(errorMessage)
  }
}

async function saveUserBet(predictions: string[], season: number) {
  try {
    const {
      data: { bet },
    } = await appBrazuerao.post(`/bets`, {
      predictions,
      season,
    })
    return bet
  } catch (error) {
    console.error(
      `Error in Brazuerao API. Erro message: ${(error as Error).message}`
    )
    const errorMessage = `Brazuerao API: ${(error as Error).message}`
    throw new Error(errorMessage)
  }
}

export {
  getIndividualUserScore,
  getBrazilianLeague,
  getAllBetRules,
  getBetByUserId,
  saveUserBet,
}
