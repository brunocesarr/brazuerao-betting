'use client'

import {
  getAllBetRules,
  getIndividualUserScore,
} from '@/services/brazuerao.service'
import { LeaderboardEntry } from '@/types'
import { ChevronDown, ChevronUp, Edit2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function LeaderboardPage() {
  const [rules, setRules] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const { data: session } = useSession()

  useEffect(() => {
    getLeaderboard()
  }, [])

  const getLeaderboard = async () => {
    try {
      const [score, rules] = await Promise.all([
        getIndividualUserScore(),
        getAllBetRules(),
      ])

      setLeaderboard([
        {
          userId: '',
          username: 'Test',
          score: [...score],
        },
      ])
      setRules(rules)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRuleTypeByRuleId = (ruleId: string): string | undefined => {
    return rules.find((rule) => rule.id === ruleId).ruleType
  }

  const toggleRow = (userId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedRows(newExpanded)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-green-500"></div>
          <p className="text-gray-400">Carregando classificação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Table Container */}
        <div className="overflow-hidden rounded-lg bg-[#2a2a2a] shadow-xl">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-gray-700 bg-[#1f1f1f] px-6 py-4 text-sm font-semibold text-gray-300">
            <div className="col-span-3">Nome</div>
            <div className="col-span-2 text-center">Pontuação</div>
            <div className="col-span-2 text-center">Acertou o Time Campeão</div>
            <div className="col-span-2 text-center">
              Nº de Times na Posição Correta
            </div>
            <div className="col-span-2 text-center">
              Nº de Times na Zona Correta
            </div>
            <div className="col-span-1"></div>
          </div>

          {/* Table Body */}
          <div>
            {leaderboard.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="text-lg text-gray-500">
                  <div className="mb-4 text-6xl">🎯</div>
                  <p className="font-semibold">Nenhuma previsão ainda!</p>
                  <p className="mt-2 text-sm">Seja o primeiro a apostar</p>
                  {!session && (
                    <Link
                      href="/login"
                      className="mt-6 inline-block rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-8 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg"
                    >
                      Entrar agora
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              leaderboard.map((entry, index) => {
                const isExpanded = expandedRows.has(entry.userId)
                const isCurrentUser = session?.user?.name === entry.username

                return (
                  <div
                    key={entry.userId}
                    className={`border-b border-gray-700/50 ${
                      index % 2 === 0 ? 'bg-[#2a2a2a]' : 'bg-[#252525]'
                    } ${isCurrentUser ? 'ring-2 ring-green-500/50' : ''}`}
                  >
                    {/* Main Row */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 text-white">
                      {/* Rank + Name */}
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-green-500 to-green-600 text-sm font-bold text-white shadow-lg">
                          {index + 1}º
                        </div>
                        <span className="font-medium">{entry.username}</span>
                      </div>

                      {/* Pontuação */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="text-lg font-semibold">
                          0{/* {entry.score || 5} */}
                        </span>
                      </div>

                      {/* Acertou o Campeão */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="text-gray-400">
                          {entry.score.find(
                            (score) =>
                              getRuleTypeByRuleId(score.ruleId) ===
                              'EXACT_CHAMPION'
                          )?.teams.length === 1
                            ? 'Sim'
                            : 'Não'}
                        </span>
                      </div>

                      {/* Nº Times Posição Correta */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="text-lg font-semibold">
                          {entry.score.find(
                            (score) =>
                              getRuleTypeByRuleId(score.ruleId) ===
                              'EXACT_POSITION'
                          )?.teams.length || 0}
                        </span>
                      </div>

                      {/* Nº Times Zona Correta */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="text-lg font-semibold">
                          {entry.score.find(
                            (score) =>
                              getRuleTypeByRuleId(score.ruleId) === 'ZONE_MATCH'
                          )?.teams.length || 0}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleRow(entry.userId)}
                          className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                        >
                          {isExpanded ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>
                        {isCurrentUser && (
                          <Link
                            href="/predictions"
                            className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                          >
                            <Edit2 size={18} />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-700/30 bg-[#1f1f1f] px-6 py-4">
                        <div className="space-y-3 text-sm">
                          {/* Times em Posições Corretas */}
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-3 font-medium text-gray-400">
                              Times em Posições Corretas
                            </div>
                            <div className="col-span-2 text-center font-semibold text-white">
                              {entry.score.find(
                                (score) =>
                                  getRuleTypeByRuleId(score.ruleId) ===
                                  'EXACT_POSITION'
                              )?.teams.length || 0}
                            </div>
                            <div className="col-span-7 text-white">
                              {entry.score
                                .find(
                                  (score) =>
                                    getRuleTypeByRuleId(score.ruleId) ===
                                    'EXACT_POSITION'
                                )
                                ?.teams?.map((team) => (
                                  <span
                                    key={team}
                                    className="mr-2 inline-block"
                                  >
                                    {team} (Xº)
                                  </span>
                                ))}
                            </div>
                          </div>

                          {/* Times em Zonas Corretas */}
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-3 font-medium text-gray-400">
                              Times em Zonas Corretas
                            </div>
                            <div className="col-span-2 text-center font-semibold text-white">
                              {entry.score.find(
                                (score) =>
                                  getRuleTypeByRuleId(score.ruleId) ===
                                  'ZONE_MATCH'
                              )?.teams.length || 0}
                            </div>
                            <div className="col-span-7 text-white">
                              {entry.score
                                .find(
                                  (score) =>
                                    getRuleTypeByRuleId(score.ruleId) ===
                                    'ZONE_MATCH'
                                )
                                ?.teams?.map((team) => (
                                  <span
                                    key={team}
                                    className="mr-2 inline-block"
                                  >
                                    {team} (Xº)
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 rounded-lg border border-green-500/30 bg-green-500/10 p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="mb-2 text-lg font-bold text-white">
                Como funciona a pontuação
              </h3>
              <p className="text-sm leading-relaxed text-gray-300">
                Cada acerto vale pontos! Veja como pontuar nas{' '}
                <Link href="/rules" className="text-green-400 hover:underline">
                  regras completas
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
