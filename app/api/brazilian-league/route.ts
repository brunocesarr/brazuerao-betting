/* eslint-disable @typescript-eslint/no-explicit-any */

import axios, { AxiosRequestConfig } from 'axios'
import { NextRequest, NextResponse } from 'next/server'

const URL_BASE_GLOBOESPORTE = 'http://globoesporte.globo.com'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9'

const defaultOptions: AxiosRequestConfig = {
  baseURL: URL_BASE_GLOBOESPORTE,
  headers: {
    'Content-Type': 'application/json',
  },
}

const apiBrasileiraoGloboEsporte = axios.create(defaultOptions)

apiBrasileiraoGloboEsporte.interceptors.request.use(
  function (config) {
    config.headers.setUserAgent(USER_AGENT)
    return config
  },
  function (error) {
    console.error(JSON.stringify(error))
    return Promise.reject(error)
  }
)

export async function GET(request: NextRequest) {
  try {
    const { data } = await apiBrasileiraoGloboEsporte.get(
      '/futebol/brasileirao-serie-a',
      { responseType: 'document' }
    )

    const regex = /const\s+classificacao\s+=\s+({.*?});/
    const match = regex.exec(data)

    if (!match) throw new Error('Não foi possível encontrar a tabela EXDD')

    const classificacaoJSON = match[1]
    const allData = JSON.parse(classificacaoJSON)

    const { classificacao } = allData

    const table = classificacao.map((team: any) => {
      return {
        position: team.ordem,
        played: team.jogos,
        name: team.nome_popular,
        shield: team.escudo,
      }
    })

    if (!table || table.length === 0)
      return NextResponse.json(
        { message: 'No data found' },
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', // or specific origin
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      )

    return NextResponse.json(table)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Internal Error', Error: (error as Error).message },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // or specific origin
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    )
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
