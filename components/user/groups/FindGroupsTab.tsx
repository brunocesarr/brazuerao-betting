import { useConfirmDialog } from '@/lib/contexts/DialogContext'
import { UserBetGroup } from '@/types/domain'
import { Search } from 'lucide-react'
import EmptyState from './EmptyState'
import GroupCard from './GroupCard'
import SearchBar from './SearchBar'

interface FindGroupsTabProps {
  groups: UserBetGroup[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onJoinRequest: (groupId: string) => void
}

export default function FindGroupsTab({
  groups,
  searchQuery,
  onSearchChange,
  onJoinRequest,
}: FindGroupsTabProps) {
  const { confirm } = useConfirmDialog()

  const handleJoinGroup = async (groupId: string) => {
    const result = await confirm({
      title: `Grupo: ${groups.find((group) => group.groupId === groupId)?.name}`,
      message: 'Deseja enviar uma solicitacao para entrar?',
      confirmText: 'Sim',
      cancelText: 'Nao',
      variant: 'info',
    })

    if (result) {
      onJoinRequest(groupId)
    }
  }

  return (
    <div className="p-6">
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Procure grupos pelo nome"
        />
      </div>

      {/* Available Groups */}
      {groups.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard
              key={group.groupId}
              group={group}
              variant="available"
              onJoinRequest={handleJoinGroup}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="Nenhum grupo encontrado."
          description="Tente ajustar sua pesquisa"
        />
      )}
    </div>
  )
}
