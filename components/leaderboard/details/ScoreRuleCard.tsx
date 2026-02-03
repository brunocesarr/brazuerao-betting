import { ScoreRuleIcon } from '@/components/leaderboard/details/ScoreRuleIcon'
import { getRuleColors } from '@/utils/leaderboard.utils'

interface ScoreRuleCardProps {
  ruleType?: string
  description?: string
  score: number
  teams: string[]
}

export const ScoreRuleCard = ({
  ruleType,
  description,
  score,
  teams,
}: ScoreRuleCardProps) => {
  const colors = getRuleColors(ruleType)

  return (
    <div
      className={`rounded-lg border bg-gradient-to-r p-6 ${colors.gradient}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-[#1a1a1a] p-3">
            <ScoreRuleIcon
              ruleType={ruleType}
              className={`h-6 w-6 ${colors.icon}`}
            />
          </div>
          <div>
            <h3 className="mb-1 text-lg font-semibold text-white">
              {description}
            </h3>
            <p className="text-sm text-gray-400">
              {teams.length} time(s) pontuado(s)
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{score}</div>
          <div className="text-xs text-gray-400">pontos</div>
        </div>
      </div>

      {teams.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {teams.map((team, idx) => (
            <span
              key={`${team}-${idx}`}
              className="inline-flex items-center rounded-full bg-[#1a1a1a] px-3 py-1.5 text-sm font-medium text-white"
            >
              {team}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
