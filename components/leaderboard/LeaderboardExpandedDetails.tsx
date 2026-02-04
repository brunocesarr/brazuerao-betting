import { RuleTypeEnum } from '@/constants/constants'
import { LeaderboardEntry, RuleBet } from '@/types'

interface LeaderboardExpandedDetailsProps {
  entry: LeaderboardEntry
  getRuleByRuleId: (ruleId: string) => RuleBet | undefined
}

interface ScoreSection {
  title: string
  score: number
  teams: string[]
  type: RuleTypeEnum
}

const EmptyTeamsMessage = () => (
  <span className="text-sm italic text-gray-500">Não previsto</span>
)

const ChampionBadge = ({ team }: { team: string }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-1.5 text-sm font-medium text-yellow-400">
    <span className="text-base">🏆</span>
    {team}
  </span>
)

const TeamBadge = ({ team }: { team: string; index: number }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1.5 text-sm text-blue-400">
    {team}
  </span>
)

export const LeaderboardExpandedDetails = ({
  entry,
  getRuleByRuleId,
}: LeaderboardExpandedDetailsProps) => {
  // Organize scores by type
  const sections: ScoreSection[] = entry.score
    .map((scoreEntry) => {
      const rule = getRuleByRuleId(scoreEntry.ruleId)
      if (!rule) return null

      return {
        title: rule.description,
        score: scoreEntry.score,
        teams: scoreEntry.teams,
        type: rule.ruleType,
      }
    })
    .filter((section): section is ScoreSection => section !== null)

  const championSection = sections.find((s) => s.type === RuleTypeEnum.champion)
  const otherSections = sections.filter((s) => s.type !== RuleTypeEnum.champion)

  return (
    <div className="border-t border-gray-700/30 bg-[#1f1f1f]">
      <div className="px-4 py-4 lg:px-6 lg:py-5">
        <div className="space-y-4 lg:space-y-6">
          {/* Champion Section */}
          {championSection && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-400 lg:text-base">
                  {championSection.title}
                </h4>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    championSection.score > 0
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {championSection.score > 0 ? '✓ Acertou' : '✗ Errou'}
                </span>
              </div>
              <div className="text-white">
                {championSection.teams.length === 0 ? (
                  <EmptyTeamsMessage />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {championSection.teams.map((team) => (
                      <ChampionBadge key={team} team={team} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other Sections */}
          {otherSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-400 lg:text-base">
                  {section.title}
                </h4>
                <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-semibold text-green-400 text-center">
                  {section.score} pts
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {section.teams.length === 0 ? (
                  <EmptyTeamsMessage />
                ) : (
                  section.teams.map((team, idx) => (
                    <TeamBadge key={`${team}-${idx}`} team={team} index={idx} />
                  ))
                )}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {sections.length === 0 && (
            <div className="py-4 text-center">
              <p className="text-sm italic text-gray-500">
                Nenhuma aposta registrada
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
