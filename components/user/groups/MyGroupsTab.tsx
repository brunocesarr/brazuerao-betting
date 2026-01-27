import { Button } from '@/components/ui/Button'
import { DefaultValues } from '@/helpers/constants'
import { useConfirmDialog } from '@/lib/contexts/DialogContext'
import { UserBetGroup } from '@/types/domain'
import { Plus, Users } from 'lucide-react'
import EmptyState from './EmptyState'
import GroupCard from './GroupCard'

interface MyGroupsTabProps {
  groups: UserBetGroup[]
  selectedGroupId?: string
  onCreateClick: () => void
  onSelectGroup: (group: UserBetGroup) => void
  onDeleteGroup: (groupId: string) => void
}

export default function MyGroupsTab({
  onSelectGroup,
  onDeleteGroup,
  groups,
  selectedGroupId,
  onCreateClick,
}: MyGroupsTabProps) {
  const { confirm } = useConfirmDialog()

  const handleDeleteGroup = async (groupId: string) => {
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

  const handleSelectGroup = (groupId: string) => {
    const group = groups.find(
      (group) =>
        group.roleGroupId === DefaultValues.adminGroupRule?.id &&
        group.groupId == groupId
    )
    if (!group) return
    onSelectGroup(group)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button type="button" variant="primary" onClick={onCreateClick}>
          <Plus className="w-5 h-5 mr-2" />
          Criar novo grupo
        </Button>
      </div>

      {groups.filter(
        (group) => group.roleGroupId === DefaultValues.adminGroupRule?.id
      ).length > 0 && (
        <div className="mb-4 rounded-lg from-primary-600/70 to-primary-600/60 bg-gradient-to-b p-4 text-center">
          <p className="text-sm text-white">
            💡 <strong>Dica:</strong> Clique sobre os grupos que voce criou para
            gerenciar os participantes.
          </p>
        </div>
      )}

      {/* Groups List */}
      {groups.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard
              key={group.groupId}
              group={group}
              isSelected={group.groupId === selectedGroupId}
              variant="my-group"
              onDeleteGroup={handleDeleteGroup}
              onExitGroup={handleDeleteGroup}
              onSelectGroup={handleSelectGroup}
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
