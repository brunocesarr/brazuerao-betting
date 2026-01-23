import { appBrazuerao } from '@/repositories/apiBrazuerao'
import {
  RulesAPIResponse,
  TeamPositionAPIResponse,
  UserScoreAPIResponse,
} from '@/types/api-models'

async function getIndividualUserScore() {
  try {
    const {
      data: { score: userScore },
    } = await appBrazuerao.get('/score')
    if (!userScore) return []
    return userScore as UserScoreAPIResponse[]
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
    }) as TeamPositionAPIResponse[]
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
    return rules as RulesAPIResponse[]
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

async function saveUserBet(predictions: string[]) {
  try {
    const {
      data: { bet },
    } = await appBrazuerao.post(`/bets`, {
      predictions,
      season: new Date().getFullYear(),
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
  getAllBetRules,
  getBetByUserId,
  getBrazilianLeague,
  getIndividualUserScore,
  saveUserBet,
}
