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
  const hasData = leaderboard.length > 0

  return (
    <div className="w-full overflow-hidden rounded-lg bg-[#2a2a2a] shadow-xl">
      {/* Desktop Header - Hidden on mobile */}
      {hasData && <LeaderboardTableHeader />}

      {/* Table Body / Card List */}
      <div className="divide-y divide-gray-700/50">
        {!hasData ? (
          <EmptyState />
        ) : (
          leaderboard.map((entry, index) => (
            <LeaderboardTableRow
              key={`${entry.userId}-${entry.groupId}`}
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
