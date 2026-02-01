import { Award, Target, TrendingUp, Trophy } from 'lucide-react'

export const RULE_ICONS = {
  champion: Trophy,
  position: Target,
  zone: Award,
  default: TrendingUp,
} as const

export const RULE_COLORS = {
  champion: {
    icon: 'text-yellow-500',
    gradient: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  },
  position: {
    icon: 'text-blue-500',
    gradient: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  },
  zone: {
    icon: 'text-purple-500',
    gradient: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  },
  default: {
    icon: 'text-gray-500',
    gradient: 'from-gray-500/20 to-gray-600/20 border-gray-500/30',
  },
} as const

export type RuleColorKey = keyof typeof RULE_COLORS
