import { LeaderboardEntry } from '@/types'
import { SummaryStats } from '@/types/leaderboard.types'

interface LeaderboardExpandedDetailsProps {
  entry: LeaderboardEntry
  stats: SummaryStats
  getRuleTypeByRuleId: (ruleId: string) => string | undefined
}

export const LeaderboardExpandedDetails = ({
  entry,
  stats,
  getRuleTypeByRuleId,
}: LeaderboardExpandedDetailsProps) => {
  const championTeams = entry.score.find(
    (score) => getRuleTypeByRuleId(score.ruleId) === '' // RULE_TYPES.EXACT_CHAMPION
  )?.teams

  const exactPositionTeams = entry.score.find(
    (score) => getRuleTypeByRuleId(score.ruleId) === '' // RULE_TYPES.EXACT_POSITION
  )?.teams

  const zoneMatchTeams = entry.score.find(
    (score) => getRuleTypeByRuleId(score.ruleId) === '' // RULE_TYPES.ZONE_MATCH
  )?.teams

  return (
    <div className="border-t border-gray-700/30 bg-[#1f1f1f] px-6 py-4">
      <div className="space-y-4">
        {/* Champion */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">
            Time Campeão
          </h4>
          <div className="text-white">
            {championTeams?.map((team) => (
              <span
                key={team}
                className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium"
              >
                🏆 {team}
              </span>
            )) || <span className="text-gray-500 text-sm">Não previsto</span>}
          </div>
        </div>

        {/* Exact Positions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">
            Times em Posições Corretas ({stats.exactPositions})
          </h4>
          <div className="flex flex-wrap gap-2">
            {exactPositionTeams?.map((team, idx) => (
              <span
                key={team}
                className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm"
              >
                {team} ({idx + 1}º)
              </span>
            )) || (
              <span className="text-gray-500 text-sm">
                Nenhum time na posição correta
              </span>
            )}
          </div>
        </div>

        {/* Zone Matches */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">
            Times em Zonas Corretas ({stats.zoneMatches})
          </h4>
          <div className="flex flex-wrap gap-2">
            {zoneMatchTeams?.map((team) => (
              <span
                key={team}
                className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm"
              >
                {team}
              </span>
            )) || (
              <span className="text-gray-500 text-sm">
                Nenhum time na zona correta
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
