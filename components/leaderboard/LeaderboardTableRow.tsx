import { LeaderboardRowProps } from '@/types/leaderboard.types'
import { ChevronDown, ChevronUp, Edit2, Eye } from 'lucide-react'
import Link from 'next/link'
import { LeaderboardExpandedDetails } from './LeaderboardExpandedDetails'

export const LeaderboardTableRow = ({
  entry,
  index,
  stats,
  isExpanded,
  isCurrentUser,
  selectedGroup,
  onToggle,
  getRuleTypeByRuleId,
}: LeaderboardRowProps) => {
  const rowBgColor = index % 2 === 0 ? 'bg-[#2a2a2a]' : 'bg-[#252525]'
  const currentUserRing = isCurrentUser ? 'ring-2 ring-green-500/50' : ''

  return (
    <div
      className={`border-b border-gray-700/50 ${rowBgColor} ${currentUserRing}`}
    >
      {/* Main Row */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 text-white">
        {/* Rank */}
        <div className="col-span-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-green-500 to-green-600 text-sm font-bold text-white shadow-lg">
            {index + 1}º
          </div>
          <span className="font-medium">{entry.username}</span>
        </div>

        {/* Score */}
        <div className="col-span-2 flex items-center justify-center">
          <span className="text-lg font-semibold">{stats.totalScore}</span>
        </div>

        {/* Champion */}
        <div className="col-span-2 flex items-center justify-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              stats.championCorrect
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {stats.championCorrect ? 'Sim' : 'Não'}
          </span>
        </div>

        {/* Exact Positions */}
        <div className="col-span-2 flex items-center justify-center">
          <span className="text-lg font-semibold">{stats.exactPositions}</span>
        </div>

        {/* Zone Matches */}
        <div className="col-span-2 flex items-center justify-center">
          <span className="text-lg font-semibold">{stats.zoneMatches}</span>
        </div>

        {/* Actions */}
        <div className="col-span-2 flex items-center justify-end gap-2">
          <Link
            href={`/leaderboard/details?userId=${entry.userId}&groupId=${selectedGroup}`}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Eye size={16} />
            Ver Detalhes
          </Link>
          <button
            onClick={() => onToggle(entry.userId)}
            className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
            aria-label={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {isCurrentUser && (
            <Link
              href="/predictions"
              className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
              title="Editar Previsões"
            >
              <Edit2 size={18} />
            </Link>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <LeaderboardExpandedDetails
          entry={entry}
          stats={stats}
          getRuleTypeByRuleId={getRuleTypeByRuleId}
        />
      )}
    </div>
  )
}
