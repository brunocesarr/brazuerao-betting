'use client'

import { useEffect, useState } from 'react'
import { LeaderboardEntry } from '@/types'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'regular' | 'final'>('regular')
  const { data: session } = useSession()

  useEffect(() => {
    fetchLeaderboard()
  }, [activeTab])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(
        '/api/leaderboard?year=' + new Date().getFullYear()
      )
      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAvatarColor = (index: number) => {
    const colors = [
      'from-orange-400 to-orange-600', // 1st
      'from-pink-400 to-pink-600', // 2nd
      'from-gray-400 to-gray-600', // 3rd
      'from-purple-400 to-purple-600', // 4th
      'from-orange-300 to-orange-500', // 5th
      'from-purple-300 to-purple-500', // 6th
      'from-orange-300 to-orange-500', // 7th
      'from-pink-300 to-pink-500', // 8th
    ]
    return colors[index % colors.length]
  }

  const getRankBadgeColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-br from-purple-500 to-purple-700'
      case 2:
        return 'bg-gradient-to-br from-blue-500 to-blue-700'
      case 3:
        return 'bg-gradient-to-br from-orange-500 to-orange-700'
      default:
        return 'bg-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-purple-500"></div>
          <p className="text-gray-400">Loading rankings...</p>
        </div>
      </div>
    )
  }

  const top3 = leaderboard.slice(0, 3)
  const remaining = leaderboard.slice(3)

  // Rearrange top 3 for podium display (2nd, 1st, 3rd)
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3

  return (
    <div className="from-primary-900 via-primary-800 to-primary-700 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Top 3 Podium */}
        {top3.length >= 3 && (
          <div className="mx-auto mb-12 grid max-w-5xl grid-cols-3 gap-6">
            {podiumOrder.map((entry, displayIndex) => {
              const actualPosition =
                displayIndex === 0 ? 2 : displayIndex === 1 ? 1 : 3
              const heightClass = actualPosition === 1 ? 'pt-0' : 'pt-12'
              const scaleClass =
                actualPosition === 1 ? 'scale-110' : 'scale-100'

              return (
                <div
                  key={entry.userId}
                  className={`flex flex-col items-center ${heightClass}`}
                >
                  {/* Rank Badge */}
                  <div
                    className={`${getRankBadgeColor(actualPosition)} mb-4 rounded-full px-4 py-1 text-lg font-bold text-white shadow-lg`}
                  >
                    #{actualPosition}
                  </div>

                  {/* Card */}
                  <div
                    className={`border bg-gradient-to-b from-gray-800 to-gray-900 ${
                      actualPosition === 1
                        ? 'border-purple-500'
                        : actualPosition === 2
                          ? 'border-blue-500'
                          : 'border-orange-500'
                    } w-full transform rounded-2xl p-6 text-center ${scaleClass} shadow-2xl transition-all duration-300 hover:scale-105`}
                  >
                    {/* Avatar */}
                    <div
                      className={`h-24 w-24 bg-gradient-to-br ${getAvatarColor(actualPosition - 1)} mx-auto mb-4 flex items-center justify-center rounded-full border-4 shadow-xl ${
                        actualPosition === 1
                          ? 'border-purple-400'
                          : actualPosition === 2
                            ? 'border-blue-400'
                            : 'border-orange-400'
                      }`}
                    >
                      <span className="text-3xl font-bold text-white">
                        {entry.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* User Name */}
                    <h3 className="mb-3 truncate text-lg font-bold text-white">
                      {entry.userName}
                    </h3>

                    {/* Stats Icons */}
                    <div className="mb-4 flex justify-center gap-3">
                      <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1">
                        <div className="h-5 w-5 rounded-full bg-green-500"></div>
                        <span className="text-sm font-semibold text-white">
                          {entry.correctGuesses}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-gray-500/20 px-3 py-1">
                        <div className="h-5 w-5 rounded-full bg-gray-400"></div>
                        <span className="text-sm font-semibold text-white">
                          20
                        </span>
                      </div>
                    </div>

                    {/* Match Stats */}
                    <div className="grid grid-cols-2 gap-3 border-t border-gray-700 pt-3">
                      <div>
                        <div className="mb-1 text-xs text-gray-400 uppercase">
                          Previsões
                        </div>
                        <div className="font-bold text-white">20 JOGOS</div>
                      </div>
                      <div>
                        <div className="mb-1 text-xs text-gray-400 uppercase">
                          Corretas
                        </div>
                        <div className="font-bold text-white">
                          {entry.correctGuesses} JOGOS
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Rankings Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          {/* Table Header */}
          <div className="grid grid-cols-12 items-center gap-4 border-b border-gray-700 bg-gray-800/80 px-6 py-4">
            <div className="col-span-1 text-sm font-semibold text-gray-400 uppercase"></div>
            <div className="col-span-3 text-sm font-semibold text-gray-400 uppercase">
              Nome
            </div>
            <div className="col-span-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
                <span className="text-sm font-semibold text-gray-400 uppercase">
                  Pontuação
                </span>
              </div>
            </div>
            <div className="col-span-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 rounded-full bg-gray-400"></div>
                <span className="text-sm font-semibold text-gray-400 uppercase">
                  Acertou o campeão
                </span>
              </div>
            </div>
            <div className="col-span-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 rounded-full bg-gray-400"></div>
                <span className="text-sm font-semibold text-gray-400 uppercase">
                  Nº de Times na Posição Correta
                </span>
              </div>
            </div>
            <div className="col-span-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 rounded-full bg-gray-400"></div>
                <span className="text-sm font-semibold text-gray-400 uppercase">
                  Nº de Times na Zona Correta
                </span>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-700/50">
            {remaining.length === 0 && top3.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="text-lg text-gray-500">
                  <div className="mb-4 text-6xl">🎯</div>
                  <p className="font-semibold">Nenhuma previsão ainda!</p>
                  <p className="mt-2 text-sm">Seja o primeiro a apostar</p>
                  {!session && (
                    <Link
                      href="/login"
                      className="mt-6 inline-block rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg"
                    >
                      Entrar agora
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              remaining.map((entry, index) => {
                const actualRank = index + 4
                const isCurrentUser = session?.user?.id === entry.userId

                return (
                  <div
                    key={entry.userId}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 transition-all duration-200 ${
                      isCurrentUser
                        ? 'border-l-4 border-purple-500 bg-purple-500/10'
                        : 'hover:bg-gray-700/30'
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex items-center">
                      <span className="text-lg font-bold text-gray-400">
                        #{actualRank}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="col-span-5 flex items-center gap-3">
                      <div
                        className={`h-12 w-12 bg-gradient-to-br ${getAvatarColor(actualRank - 1)} flex items-center justify-center rounded-full shadow-lg`}
                      >
                        <span className="text-lg font-semibold text-white">
                          {entry.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-white">
                          {entry.userName}
                          {isCurrentUser && (
                            <span className="rounded-full bg-purple-500 px-2 py-0.5 text-xs text-white">
                              Você
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Correct Score */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {entry.correctGuesses}
                      </span>
                      <span className="ml-1 text-sm text-gray-400">PONTOS</span>
                    </div>

                    {/* Total */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">20</span>
                      <span className="ml-1 text-sm text-gray-400">PONTOS</span>
                    </div>

                    {/* Total */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">20</span>
                      <span className="ml-1 text-sm text-gray-400">PONTOS</span>
                    </div>

                    {/* Total */}
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">20</span>
                      <span className="ml-1 text-sm text-gray-400">PONTOS</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="mb-2 text-lg font-bold text-white">
                Como é a pontuação
              </h3>
              <p className="text-sm leading-relaxed text-gray-300">
                Veja como você pode pontuar:{' '}
                <Link
                  href="/rules"
                  className="text-blue-400 hover:underline"
                  scroll
                >
                  regras
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
