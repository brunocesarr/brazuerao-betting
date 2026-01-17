'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { TeamPrediction } from '@/types'
import { getCurrentBrazilianLeague } from '@/services/brazuerao.service'
import Image from 'next/image'

export default function BettingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [predictions, setPredictions] = useState<TeamPrediction[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchBrazilianLeague()
  }, [])

  const fetchBrazilianLeague = async () => {
    try {
      const league = await getCurrentBrazilianLeague()
      setPredictions(
        league.map((team, index) => ({
          teamId: index.toString(),
          teamName: team.name,
          position: team.posicao,
          shieldUrl: team.logo,
        }))
      )
    } catch (error) {
      console.error('Failed to fetch brazilian league:', error)
    } finally {
      setLoading(false)
    }
  }

  const moveTeam = (index: number, direction: 'up' | 'down') => {
    const newPredictions = [...predictions]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newPredictions.length) return
    ;[newPredictions[index], newPredictions[targetIndex]] = [
      newPredictions[targetIndex],
      newPredictions[index],
    ]

    newPredictions.forEach((pred, idx) => {
      pred.position = idx + 1
    })

    setPredictions(newPredictions)
    setHasChanges(true)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predictions,
          year: new Date().getFullYear(),
        }),
      })

      if (response.ok) {
        setMessage({
          type: 'success',
          text: '✓ Sua previsão foi salva com sucesso!',
        })
        setHasChanges(false)
      } else {
        setMessage({
          type: 'error',
          text: '✗ Falha ao salvar sua previsão. Tente novamente.',
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: '✗ Ocorreu um erro. Tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary-600 mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const getPositionColor = (position: number) => {
    if (position <= 4) return 'bg-blue-50 border-blue-200'
    if (position <= 12) return 'bg-green-50 border-green-200'
    if (position <= 16) return 'bg-gray-50 border-gray-200'
    return 'bg-red-50 border-red-200'
  }

  const getPositionBadge = (position: number) => {
    if (position <= 4) return { text: 'Libertadores', color: 'bg-blue-500' }
    if (position <= 12) return { text: 'Sul-Americana', color: 'bg-green-500' }
    if (position <= 16) return { text: 'Meio da tabela', color: 'bg-gray-500' }
    return { text: 'Rebaixamento', color: 'bg-red-500' }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold text-gray-900">
            Sua previsão para o Brasileirão 2026
          </h1>
          <p className="text-lg text-gray-600">
            Ordene os times na ordem que você acha que vão terminar
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`animate-fade-in mb-6 rounded-xl border-2 p-4 ${
              message.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            <p className="text-center font-medium">{message.text}</p>
          </div>
        )}

        {/* Legend */}
        <div className="card mb-6 p-6">
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 rounded bg-blue-500"></div>
              <span className="text-sm text-gray-700">Libertadores (1-4)</span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 rounded bg-green-500"></div>
              <span className="text-sm text-gray-700">Sul-Americana (5-6)</span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 rounded bg-orange-500"></div>
              <span className="text-sm text-gray-700">Danger (13-16)</span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 rounded bg-red-500"></div>
              <span className="text-sm text-gray-700">Relegation (17-20)</span>
            </div>
          </div>
        </div>

        {/* Standings Table */}
        <div className="card mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="from-primary-600 to-primary-700 bg-gradient-to-r text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Posição
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Time
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Zona
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">
                    Mover
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {predictions.map((pred, index) => {
                  const badge = getPositionBadge(pred.position)
                  return (
                    <tr
                      key={pred.teamId}
                      className={`transition-all duration-200 hover:shadow-md ${getPositionColor(pred.position)}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="w-8 text-2xl font-bold text-gray-700">
                            {pred.position}
                          </span>
                          <span className="ml-2 text-gray-400">º</span>
                        </div>
                      </td>
                      <td className="flex items-center px-6 py-4">
                        {pred.shieldUrl && (
                          <Image
                            src={pred.shieldUrl}
                            alt={pred.teamName}
                            width={24}
                            height={24}
                            className="mr-2"
                          />
                        )}
                        <span className="text-lg font-semibold text-gray-900">
                          {pred.teamName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block ${badge.color} rounded-full px-3 py-1 text-xs font-semibold text-white`}
                        >
                          {badge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => moveTeam(index, 'up')}
                            disabled={index === 0}
                            className="bg-primary-500 hover:bg-primary-600 rounded-lg p-2 text-white shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-30"
                            title="Mover para cima"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveTeam(index, 'down')}
                            disabled={index === predictions.length - 1}
                            className="bg-primary-500 hover:bg-primary-600 rounded-lg p-2 text-white shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-30"
                            title="Mover para baixo"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={loading || !hasChanges}
            className="btn-primary relative px-12 py-4 text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Salvando...
              </span>
            ) : (
              <>
                💾 Salvar minha previsão
                {!hasChanges && (
                  <span className="ml-2 text-sm opacity-75">
                    (Sem alterações)
                  </span>
                )}
              </>
            )}
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Você pode editar sua previsão a qualquer momento antes do início da
            temporada
          </p>
        </div>
      </div>
    </div>
  )
}
