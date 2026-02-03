import { MapPin, Target, Trophy } from 'lucide-react'

interface ScoreRuleIconProps {
  ruleType?: string
  className?: string
}

export function ScoreRuleIcon({
  ruleType,
  className = '',
}: ScoreRuleIconProps) {
  switch (ruleType) {
    case 'champion':
      return <Trophy className={className} />
    case 'exactPosition':
      return <Target className={className} />
    case 'correctZone':
      return <MapPin className={className} />
    default:
      return <Target className={className} />
  }
}
