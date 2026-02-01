import { RuleTypeEnum } from '@/constants/constants'
import { LeaderboardEntry, RuleBet } from '@/types'

interface LeaderboardExpandedDetailsProps {
  entry: LeaderboardEntry
  getRuleByRuleId: (ruleId: string) => RuleBet | undefined
}

export const LeaderboardExpandedDetails = ({
  entry,
  getRuleByRuleId,
}: LeaderboardExpandedDetailsProps) => {
  return (
    <div className="border-t border-gray-700/30 bg-[#1f1f1f] px-6 py-4">
      <div className="space-y-4">
        {entry.score.map((scoreEntry, index) => {
          if (
            getRuleByRuleId(scoreEntry.ruleId)?.ruleType ===
            RuleTypeEnum.champion
          ) {
            return (
              <div key={index}>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">
                  Time Campeão
                </h4>
                <div className="text-white">
                  {scoreEntry.teams.length === 0 ? (
                    <span className="text-gray-500 text-sm">Não previsto</span>
                  ) : (
                    scoreEntry.teams?.map((team) => (
                      <span
                        key={team}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium"
                      >
                        🏆 {team}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )
          } else {
            return (
              <div key={index}>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">
                  {getRuleByRuleId(scoreEntry.ruleId)?.description} (
                  {scoreEntry.score})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {scoreEntry.teams.length === 0 ? (
                    <span className="text-gray-500 text-sm">
                      Nenhum time na previsto
                    </span>
                  ) : (
                    scoreEntry.teams?.map((team, idx) => (
                      <span
                        key={team}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm"
                      >
                        {team}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )
          }
        })}
      </div>
    </div>
  )
}
