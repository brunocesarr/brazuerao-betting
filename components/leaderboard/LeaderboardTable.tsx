import { LeaderboardEntry, RuleBet } from '@/types'
import { EmptyState } from './EmptyState'
import { LeaderboardTableHeader } from './LeaderboardTableHeader'
import { LeaderboardTableRow } from './LeaderboardTableRow'

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[]
  expandedRows: Set<string>
  selectedGroup: string
  currentUsername?: string | null
  onToggleRow: (userId: string) => void
  getRuleByRuleId: (ruleId: string) => RuleBet | undefined
}

export const LeaderboardTable = ({
  leaderboard,
  expandedRows,
  selectedGroup,
  currentUsername,
  onToggleRow,
  getRuleByRuleId,
}: LeaderboardTableProps) => {
  return (
    <div className="overflow-hidden rounded-lg bg-[#2a2a2a] shadow-xl">
      <LeaderboardTableHeader />
      <div>
        {leaderboard.length === 0 ? (
          <EmptyState />
        ) : (
          leaderboard.map((entry, index) => (
            <LeaderboardTableRow
              key={entry.userId}
              entry={entry}
              index={index}
              isExpanded={expandedRows.has(entry.userId)}
              isCurrentUser={currentUsername === entry.username}
              selectedGroup={selectedGroup}
              onToggle={onToggleRow}
              getRuleByRuleId={getRuleByRuleId}
            />
          ))
        )}
      </div>
    </div>
  )
}
