import { LeaderboardEntry } from '@/types'
import { ScoreRuleCard } from './ScoreRuleCard'

interface ScoreBreakdownProps {
  scoreDetails: LeaderboardEntry
  getRuleByRuleId: (
    ruleId: string
  ) => { ruleType?: string; description?: string } | undefined
}

export const ScoreBreakdown = ({
  scoreDetails,
  getRuleByRuleId,
}: ScoreBreakdownProps) => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-white mb-4">
      Detalhamento por Regra
    </h2>

    {scoreDetails.score.map((detail) => {
      const rule = getRuleByRuleId(detail.ruleId)
      return (
        <ScoreRuleCard
          key={detail.ruleId}
          ruleType={rule?.ruleType}
          description={rule?.description}
          score={detail.score}
          teams={detail.teams}
        />
      )
    })}
  </div>
)
