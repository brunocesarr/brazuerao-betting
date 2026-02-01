import { Trophy } from 'lucide-react'

interface TotalScoreCardProps {
  totalScore: number
  scoredRulesCount: number
}

export const TotalScoreCard = ({
  totalScore,
  scoredRulesCount,
}: TotalScoreCardProps) => (
  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-8 shadow-lg mb-8">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium mb-1">
          Pontuação Total
        </p>
        <p className="text-5xl font-bold text-white">{totalScore}</p>
        <p className="text-white/70 text-sm mt-2">
          {scoredRulesCount} regras pontuadas
        </p>
      </div>
      <div className="p-4 bg-white/20 rounded-full">
        <Trophy className="w-12 h-12 text-white" />
      </div>
    </div>
  </div>
)
