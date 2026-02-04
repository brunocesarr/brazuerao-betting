interface PredictionsTableProps {
  predictions: string[]
}

export const PredictionsTable = ({ predictions }: PredictionsTableProps) => {
  if (!predictions || predictions.length === 0) {
    return null
  }

  return (
    <div className="mt-8 bg-[#242424] rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Sua Aposta</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">
                Posição
              </th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((team, index) => (
              <tr
                key={`${team}-${index}`}
                className="border-b border-gray-800 hover:bg-[#2a2a2a] transition-colors"
              >
                <td className="py-3 px-4 text-white font-semibold">
                  {index + 1}º
                </td>
                <td className="py-3 px-4 text-white">{team}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
