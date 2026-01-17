import { appBrazuerao } from '@/repositories/apiBrazuerao'
import {
  getIndividualUserScore,
  getBrazilianLeague,
} from '@/repositories/brazuerao.repository'

async function getUserScore(classification: string[]) {
  return await getIndividualUserScore(classification)
}

async function getCurrentBrazilianLeague(
  year: number = new Date().getFullYear()
) {
  const { data: brazilianLeague } = await appBrazuerao.get<any[]>(
    `/brazilian-league?year=${year}`
  )
  return brazilianLeague
}

export { getUserScore, getCurrentBrazilianLeague }
