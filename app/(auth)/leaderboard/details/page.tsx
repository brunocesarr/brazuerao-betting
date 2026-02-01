'use client'

import { PageHeader } from '@/components/leaderboard/details/PageHeader'
import { PredictionsTable } from '@/components/leaderboard/details/PredictionsTable'
import { ScoreBreakdown } from '@/components/leaderboard/details/ScoreBreakdown'
import { TotalScoreCard } from '@/components/leaderboard/details/TotalScoreCard'
import { Button } from '@/components/shared/Button'
import { LoadingState } from '@/components/shared/LoadingState'
import { useLeaderboard } from '@/lib/contexts/LeaderboardContext'
import { useBetDeadline } from '@/lib/hooks/useBetDeadline'
import { useLeaderboardDetails } from '@/lib/hooks/useLeaderboardDetails'
import { calculateScoredRules } from '@/utils/leaderboard.utils'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LeaderboardDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const userId = searchParams.get('userId')
  const groupId = searchParams.get('groupId')

  const { leaderboard, getRuleByRuleId, username, groups } = useLeaderboard()
  const { isExpired } = useBetDeadline(groupId, groups)
  const { scoreDetails, loading } = useLeaderboardDetails({
    userId,
    groupId,
    leaderboard,
  })

  const handleEditPredictions = () => {
    router.push(`/betting?groupId=${groupId}`)
  }

  if (loading) {
    return <LoadingState message="Carregando detalhes..." />
  }

  if (!scoreDetails) {
    return null
  }

  const scoredRulesCount = calculateScoredRules(scoreDetails.score)

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <PageHeader />

        <TotalScoreCard
          totalScore={scoreDetails.totalScore}
          scoredRulesCount={scoredRulesCount}
        />

        <ScoreBreakdown
          scoreDetails={scoreDetails}
          getRuleByRuleId={getRuleByRuleId}
        />

        <PredictionsTable predictions={scoreDetails.predictions} />

        {username && (
          <Button
            className="flex-1 mt-8 flex gap-4 w-full h-14"
            type="button"
            variant="primary"
            onClick={handleEditPredictions}
            disabled={isExpired}
          >
            Editar Previsões
          </Button>
        )}
      </div>
    </div>
  )
}
