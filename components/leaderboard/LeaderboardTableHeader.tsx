export const LeaderboardTableHeader = () => (
  <div className="hidden border-b border-gray-700 bg-[#1f1f1f] px-4 py-3 lg:block">
    <div className="grid grid-cols-12 gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400 xl:gap-4 xl:text-sm">
      <div className="col-span-3">Jogador</div>
      <div className="col-span-2 text-center">Pontuação</div>
      <div className="col-span-2 text-center">Campeão</div>
      <div className="col-span-2 text-center">Pos. Exatas</div>
      <div className="col-span-2 text-center">Zonas</div>
      <div className="col-span-1 text-right">Ações</div>
    </div>
  </div>
)
