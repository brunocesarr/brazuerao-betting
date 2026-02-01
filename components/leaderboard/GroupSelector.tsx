import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
    <Select value={selectedGroup} onChange={(e) => onChange(e.target.value)}>
      <SelectTrigger className="block w-full md:w-64 h-16 rounded-lg bg-[#2a2a2a] border border-gray-700 px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
        <SelectValue placeholder={'Selecione um grupo'} />
      </SelectTrigger>
      <SelectContent>
        {groups.length === 0 ? (
          <SelectItem key={'empty'} value={''} className="hover:cursor-pointer">
            Nenhum grupo disponível
          </SelectItem>
        ) : (
          groups.map((group) => (
            <SelectItem
              key={group.groupId}
              value={group.groupId}
              className="hover:cursor-pointer"
            >
              {group.name}
              {group.isPrivate && ' 🔒'}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
      <ChevronDown size={20} />
    </div>
  </div>
)
