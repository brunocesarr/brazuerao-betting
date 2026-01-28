import { StatCard } from '@/components/leaderboard/StatCard'
import { RuleTypeEnum } from '@/helpers/constants'
import { RuleBet, ScoreEntry } from '@/types'
import { Award, Target, Trophy } from 'lucide-react'

interface SummaryCardsProps {
  stats: ScoreEntry[]
  rules: RuleBet[]
}

const statCardStyles = [
  {
    icon: Target,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/20',
  },
  {
    icon: Target,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-500/20',
  },
]

export const SummaryCards = ({ stats, rules }: SummaryCardsProps) => {
  const totalScore = stats.reduce((total, item) => total + item.score, 0)

  const getValue = (rule: RuleBet) => {
    const stat = stats.find((stat) => stat.ruleId === rule.id)

    if (rule.ruleType === RuleTypeEnum.champion) {
      return stat ? 'SIM' : 'NAO'
    } else {
      return stat?.teams.length ?? 0
    }
  }

  const getStatCardStyle = (rule: RuleBet) => {
    if (rule.ruleType === RuleTypeEnum.champion) {
      return {
        icon: Award,
        iconColor: 'text-yellow-500',
        iconBg: 'bg-yellow-500/20',
      }
    } else {
      return statCardStyles[Math.floor(Math.random() * statCardStyles.length)]
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        icon={Trophy}
        value={totalScore}
        label="Pontuação Total"
        variant="primary"
        iconColor="text-white"
        iconBg="bg-white/20"
      />
      {rules.map((rule) => (
        <StatCard
          key={rule.id}
          value={getValue(rule)}
          label={rule.description}
          {...getStatCardStyle(rule)}
        />
      ))}
    </div>
  )
}
