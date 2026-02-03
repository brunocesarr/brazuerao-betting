import { StatCard } from '@/components/leaderboard/StatCard'
import { RuleTypeEnum } from '@/constants/constants'
import { RuleBet, ScoreEntry } from '@/types'
import { Award, LucideProps, MapPin, Target, Trophy } from 'lucide-react'
import { RefAttributes } from 'react'

interface SummaryCardsProps {
  stats: ScoreEntry[]
  rules: RuleBet[]
}

// Map rule types to specific styles
const RULE_TYPE_STYLES: Record<
  string,
  {
    icon: React.ForwardRefExoticComponent<
      Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
    >
    iconColor: string
    iconBg: string
  }
> = {
  [RuleTypeEnum.champion]: {
    icon: Award,
    iconColor: 'text-yellow-500',
    iconBg: 'bg-yellow-500/20',
  },
  [RuleTypeEnum.position]: {
    icon: Target,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/20',
  },
  [RuleTypeEnum.zone]: {
    icon: MapPin,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-500/20',
  },
}

// Default style for unknown types
const DEFAULT_STYLE = {
  icon: Target,
  iconColor: 'text-gray-500',
  iconBg: 'bg-gray-500/20',
}

export const SummaryCards = ({ stats, rules }: SummaryCardsProps) => {
  const totalScore = stats.reduce((total, item) => total + item.score, 0)

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* Total Score */}
      <StatCard
        icon={Trophy}
        value={totalScore}
        label="Pontuação Total"
        variant="primary"
        iconColor="text-white"
        iconBg="bg-white/20"
      />

      {/* Rule Cards */}
      {rules.map((rule) => {
        const style = RULE_TYPE_STYLES[rule.ruleType] || DEFAULT_STYLE
        const stat = stats.find((s) => s.ruleId === rule.id)

        const value =
          rule.ruleType === RuleTypeEnum.champion
            ? stat
              ? 'SIM'
              : 'NÃO'
            : (stat?.teams.length ?? 0)

        return (
          <StatCard
            key={rule.id}
            icon={style.icon}
            value={value}
            label={rule.description}
            iconColor={style.iconColor}
            iconBg={style.iconBg}
          />
        )
      })}
    </div>
  )
}
