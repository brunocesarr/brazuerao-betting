import { LeaderboardEntry } from '@/types'
import { SummaryStats } from '@/types/leaderboard.types'
import { EmptyState } from './EmptyState'
import { LeaderboardTableHeader } from './LeaderboardTableHeader'
import { LeaderboardTableRow } from './LeaderboardTableRow'

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[]
  stats: SummaryStats
  expandedRows: Set<string>
  selectedGroup: string
  currentUsername?: string | null
  onToggleRow: (userId: string) => void
  getRuleTypeByRuleId: (ruleId: string) => string | undefined
}

export const LeaderboardTable = ({
  leaderboard,
  stats,
  expandedRows,
  selectedGroup,
  currentUsername,
  onToggleRow,
  getRuleTypeByRuleId,
}: LeaderboardTableProps) => (
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
            stats={stats}
            isExpanded={expandedRows.has(entry.userId)}
            isCurrentUser={currentUsername === entry.username}
            selectedGroup={selectedGroup}
            onToggle={onToggleRow}
            getRuleTypeByRuleId={getRuleTypeByRuleId}
          />
        ))
      )}
    </div>
  </div>
)
