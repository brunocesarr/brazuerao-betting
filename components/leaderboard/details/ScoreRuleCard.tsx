import { getRuleColors, getRuleIcon } from '@/utils/leaderboard.utils'

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
  const Icon = getRuleIcon(ruleType)
  const colors = getRuleColors(ruleType)

  return (
    <div
      className={`bg-gradient-to-r ${colors.gradient} border rounded-lg p-6`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#1a1a1a] rounded-lg">
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
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

      <div className="flex flex-wrap gap-2 mt-4">
        {teams.map((team, idx) => (
          <span
            key={`${team}-${idx}`}
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#1a1a1a] text-white text-sm font-medium"
          >
            {team}
          </span>
        ))}
      </div>
    </div>
  )
}
