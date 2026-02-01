import { RuleTypeEnum } from '@/constants/constants'
import { LeaderboardRowProps } from '@/types/leaderboard.types'
import { ChevronDown, ChevronUp, Edit2, Eye } from 'lucide-react'
import Link from 'next/link'
import { LeaderboardExpandedDetails } from './LeaderboardExpandedDetails'

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉']

const getRankDisplay = (position: number): string => {
  return position <= 3 ? MEDAL_EMOJIS[position - 1] : `${position}º`
}

const getRowStyles = (index: number, isCurrentUser: boolean): string => {
  const baseStyles = 'transition-colors duration-200'
  const bgColor = index % 2 === 0 ? 'bg-[#2a2a2a]' : 'bg-[#252525]'
  const currentUserRing = isCurrentUser
    ? 'ring-2 ring-green-500/50 bg-green-500/5'
    : ''
  const hoverStyles = 'hover:bg-[#2f2f2f]'

  return `${baseStyles} ${bgColor} ${currentUserRing} ${hoverStyles}`
}

export const LeaderboardTableRow = ({
  entry,
  index,
  isExpanded,
  isCurrentUser,
  selectedGroup,
  onToggle,
  getRuleByRuleId,
}: LeaderboardRowProps) => {
  const position = index + 1
  const championScore = entry.score.find(
    (s) => getRuleByRuleId(s.ruleId)?.ruleType === RuleTypeEnum.champion
  )
  const exactPositionsScore = entry.score.find(
    (s) => getRuleByRuleId(s.ruleId)?.ruleType === RuleTypeEnum.position
  )
  const correctZonesScore = entry.score.find(
    (s) => getRuleByRuleId(s.ruleId)?.ruleType === RuleTypeEnum.zone
  )

  return (
    <div className={getRowStyles(index, isCurrentUser)}>
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-12 gap-2 px-4 py-4 text-white xl:gap-4">
          {/* Rank & Username */}
          <div className="col-span-3 flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-sm font-bold text-white shadow-md">
              {getRankDisplay(position)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{entry.username}</p>
              {isCurrentUser && (
                <span className="text-xs text-green-400">Você</span>
              )}
            </div>
          </div>

          {/* Total Score */}
          <div className="col-span-2 flex items-center justify-center">
            <span className="text-xl font-bold text-green-400">
              {entry.totalScore}
            </span>
          </div>

          {/* Champion */}
          <div className="col-span-2 flex items-center justify-center">
            {championScore && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  championScore.score > 0
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {championScore.score > 0 ? '✓ Sim' : '✗ Não'}
              </span>
            )}
          </div>

          {/* Exact Positions */}
          <div className="col-span-2 flex items-center justify-center">
            <span className="text-lg font-semibold">
              {exactPositionsScore?.score ?? 0}
            </span>
          </div>

          {/* Correct Zones */}
          <div className="col-span-2 flex items-center justify-center">
            <span className="text-lg font-semibold">
              {correctZonesScore?.score ?? 0}
            </span>
          </div>

          {/* Actions */}
          <div className="col-span-1 flex items-center justify-end gap-1">
            <Link
              href={`/leaderboard/details?userId=${entry.userId}&groupId=${selectedGroup}`}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
              title="Ver detalhes"
            >
              <Eye size={18} />
            </Link>
            <button
              onClick={() => onToggle(entry.userId)}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
              aria-label={
                isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'
              }
              aria-expanded={isExpanded}
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {isCurrentUser && (
              <Link
                href={`/betting?groupId=${selectedGroup}`}
                className="rounded-lg p-2 text-blue-400 transition-colors hover:bg-blue-500/10 hover:text-blue-300"
                title="Editar previsões"
              >
                <Edit2 size={18} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout - Card Style */}
      <div className="block px-4 py-4 lg:hidden">
        {/* Header Section */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-base font-bold text-white shadow-md">
              {getRankDisplay(position)}
            </div>
            <div>
              <p className="font-semibold text-white">{entry.username}</p>
              {isCurrentUser && (
                <span className="text-xs text-green-400">Você</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-400">
              {entry.totalScore}
            </p>
            <p className="text-xs text-gray-400">pontos</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-3 grid grid-cols-3 gap-2 rounded-lg bg-[#1f1f1f] p-3">
          <div className="text-center">
            <p className="text-xs text-gray-400">Campeão</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {championScore && championScore.score > 0 ? '✓' : '✗'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Pos. Exatas</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {exactPositionsScore?.score ?? 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Zonas</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {correctZonesScore?.score ?? 0}
            </p>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex gap-2">
          <Link
            href={`/leaderboard/details?userId=${entry.userId}&groupId=${selectedGroup}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            <Eye size={16} />
            <span>Ver Detalhes</span>
          </Link>
          <button
            onClick={() => onToggle(entry.userId)}
            className="flex items-center justify-center rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600"
            aria-label={isExpanded ? 'Recolher' : 'Expandir'}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {isCurrentUser && (
            <Link
              href={`/betting?groupId=${selectedGroup}`}
              className="flex items-center justify-center rounded-lg bg-blue-500/20 px-4 py-2 text-blue-400 transition-colors hover:bg-blue-500/30"
              title="Editar"
            >
              <Edit2 size={18} />
            </Link>
          )}
        </div>
      </div>

      {/* Expanded Details - Same for both layouts */}
      {isExpanded && (
        <LeaderboardExpandedDetails
          entry={entry}
          getRuleByRuleId={getRuleByRuleId}
        />
      )}
    </div>
  )
}
