'use client'

import { Button } from '@/components/shared/Button'
import { useLeaderboard } from '@/lib/contexts/LeaderboardContext'
import { LeaderboardEntry } from '@/types'
import { ArrowLeft, Award, Target, TrendingUp, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LeaderboardDetailsPage() {
  const { leaderboard, getRuleByRuleId, username, groups } = useLeaderboard()

  const searchParams = useSearchParams()
  const router = useRouter()
  const userId = searchParams.get('userId')
  const groupId = searchParams.get('groupId')

  const [loading, setLoading] = useState(true)
  const [scoreDetails, setScoreDetails] = useState<LeaderboardEntry>()

  useEffect(() => {
    if (userId && groupId) {
      loadScoreDetails()
    } else {
      router.replace('/leaderboard')
    }
  }, [userId, groupId])

  const loadScoreDetails = async () => {
    try {
      setLoading(true)
      const score = leaderboard.find(
        (scoreUser) =>
          scoreUser.userId === userId && scoreUser.groupId === groupId
      )
      if (!score) {
        router.replace('/leaderboard')
      }
      setScoreDetails(score)
    } catch (error) {
      console.error('Failed to load score details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRuleIcon = (ruleType?: string) => {
    switch (ruleType) {
      case 'EXACT_CHAMPION':
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 'EXACT_POSITION':
        return <Target className="w-6 h-6 text-blue-500" />
      case 'ZONE_MATCH':
        return <Award className="w-6 h-6 text-purple-500" />
      default:
        return <TrendingUp className="w-6 h-6 text-gray-500" />
    }
  }

  const getRuleBgColor = (ruleType?: string) => {
    switch (ruleType) {
      case 'EXACT_CHAMPION':
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30'
      case 'EXACT_POSITION':
        return 'from-blue-500/20 to-blue-600/20 border-blue-500/30'
      case 'ZONE_MATCH':
        return 'from-purple-500/20 to-purple-600/20 border-purple-500/30'
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30'
    }
  }

  const isDeadlineExpired = (): boolean => {
    const group = groups.find((group) => group.groupId === groupId)
    if (!group) return true
    return new Date(group.deadlineAt).getTime() < new Date().getTime()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a1a]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-green-500"></div>
          <p className="text-gray-400">Carregando detalhes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para Classificação
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            Detalhes da Pontuação
          </h1>
          <p className="text-gray-400">
            Veja como seus pontos foram distribuídos
          </p>
        </div>

        {/* Total Score Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-8 shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">
                Pontuação Total
              </p>
              <p className="text-5xl font-bold text-white">
                {scoreDetails?.totalScore}
              </p>
              <p className="text-white/70 text-sm mt-2">
                {
                  scoreDetails?.score.filter(
                    (scoreEntry) => scoreEntry.score > 0
                  ).length
                }{' '}
                regras pontuadas
              </p>
            </div>
            <div className="p-4 bg-white/20 rounded-full">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">
            Detalhamento por Regra
          </h2>

          {scoreDetails?.score.map((detail) => (
            <div
              key={detail.ruleId}
              className={`bg-gradient-to-r ${getRuleBgColor(getRuleByRuleId(detail.ruleId)?.ruleType)} border rounded-lg p-6`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#1a1a1a] rounded-lg">
                    {getRuleIcon(getRuleByRuleId(detail.ruleId)?.ruleType)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {getRuleByRuleId(detail.ruleId)?.description}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {detail.teams.length} time(s) pontuado(s)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {detail.score}
                  </div>
                  <div className="text-xs text-gray-400">pontos</div>
                </div>
              </div>

              {/* Teams List */}
              <div className="flex flex-wrap gap-2 mt-4">
                {detail.teams.map((team, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#1a1a1a] text-white text-sm font-medium"
                  >
                    {team}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {username && (
          <Button
            className="flex-1 mt-8 flex gap-4 w-full h-14"
            type="button"
            variant="primary"
            onClick={() => router.push(`/betting?groupId=${groupId}`)}
            disabled={isDeadlineExpired()}
          >
            Editar Previsões
          </Button>
        )}
      </div>
    </div>
  )
}
