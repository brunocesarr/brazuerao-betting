import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  variant?: 'primary' | 'secondary'
  iconColor?: string
  iconBg?: string
}

export const StatCard = ({
  icon: Icon,
  value,
  label,
  variant = 'secondary',
  iconColor = 'text-white',
  iconBg = 'bg-white/20',
}: StatCardProps) => {
  const cardStyles =
    variant === 'primary'
      ? 'bg-gradient-to-br from-green-500 to-green-600'
      : 'bg-[#2a2a2a] border border-gray-700'

  const textStyles = variant === 'primary' ? 'text-white' : 'text-white'
  const labelStyles = variant === 'primary' ? 'text-white/80' : 'text-gray-400'

  return (
    <div className={`rounded-lg p-6 shadow-lg ${cardStyles}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      <div className={`text-3xl font-bold mb-1 ${textStyles} text-center`}>
        {value}
      </div>
      <div className={`text-sm ${labelStyles} text-center`}>{label}</div>
    </div>
  )
}
