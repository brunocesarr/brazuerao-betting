import { UserBetGroup } from '@/types/domain'
import { ChevronDown } from 'lucide-react'

interface GroupSelectorProps {
  groups: UserBetGroup[]
  selectedGroup: string
  onChange: (groupId: string) => void
}

export const GroupSelector = ({
  groups,
  selectedGroup,
  onChange,
}: GroupSelectorProps) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Selecione o Grupo
    </label>
    <div className="relative">
      <select
        value={selectedGroup}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full md:w-64 rounded-lg bg-[#2a2a2a] border border-gray-700 px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      >
        {groups.length === 0 ? (
          <option value="">Nenhum grupo disponível</option>
        ) : (
          groups.map((group) => (
            <option key={group.groupId} value={group.groupId}>
              {group.name}
            </option>
          ))
        )}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
        <ChevronDown size={20} />
      </div>
    </div>
  </div>
)
