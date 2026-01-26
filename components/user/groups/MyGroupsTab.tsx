import { Button } from '@/components/ui/Button'
import { useConfirmDialog } from '@/lib/contexts/DialogContext'
import { UserBetGroup } from '@/types/domain'
import { Plus, Users } from 'lucide-react'
import EmptyState from './EmptyState'
import GroupCard from './GroupCard'

interface MyGroupsTabProps {
  groups: UserBetGroup[]
  onCreateClick: () => void
  onDeleteGroup: (groupId: string) => void
}

export default function MyGroupsTab({
  onDeleteGroup,
  groups,
  onCreateClick,
}: MyGroupsTabProps) {
  const { confirm } = useConfirmDialog()

  const handleInfo = async (groupId: string) => {
    const result = await confirm({
      title: 'Atencao',
      message: 'Deseja seguir com a acao?',
      confirmText: 'Sim',
      cancelText: 'Nao',
      variant: 'danger',
    })

    if (result) {
      onDeleteGroup(groupId)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button type="button" variant="primary" onClick={onCreateClick}>
          <Plus className="w-5 h-5 mr-2" />
          Criar novo grupo
        </Button>
      </div>

      {/* Groups List */}
      {groups.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard
              key={group.groupId}
              group={group}
              variant="my-group"
              onDeleteGroup={handleInfo}
              onExitGroup={handleInfo}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="Nenhum grupo encontrado."
          description="Crie ou entre em um grupo para comecar."
        />
      )}
    </div>
  )
}
