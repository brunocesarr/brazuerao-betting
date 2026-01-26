import { Button } from '@/components/ui/Button'
import { DefaultValues } from '@/helpers/constants'
import { UserBetGroup } from '@/types/domain'
import { Globe, Lock, Send } from 'lucide-react'

interface GroupCardProps {
  group: UserBetGroup
  variant: 'my-group' | 'available'
  onJoinRequest?: (groupId: string) => void
  onDeleteGroup?: (groupId: string) => void
  onExitGroup?: (groupId: string) => void
}

export default function GroupCard({
  onDeleteGroup,
  onExitGroup,
  group,
  variant,
  onJoinRequest,
}: GroupCardProps) {
  const isMyGroup = variant === 'my-group'
  const isAdmin = group.roleGroupId === DefaultValues.adminGroupRule?.id
  const isPending =
    group.requestStatusId &&
    group.requestStatusId === DefaultValues.pendingRequestStatus?.id
  const isApproved =
    group.requestStatusId &&
    group.requestStatusId === DefaultValues.approvedRequestStatus?.id

  return (
    <div
      className={`rounded-lg border border-gray-300/80 p-5 hover:shadow-md transition-shadow ${
        isMyGroup ? 'bg-gradient-to-r from-white to-gray-100' : 'bg-white'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {group.isPrivate ? (
            <Lock className="w-4 h-4 text-gray-500" />
          ) : (
            <Globe className="w-4 h-4 text-gray-500" />
          )}
          <h3 className="font-semibold text-gray-900">{group.name}</h3>
        </div>
        {isMyGroup && isAdmin && (
          <span className="px-2 py-1 text-xs font-medium bg-primary-300 text-white rounded">
            Admin
          </span>
        )}
      </div>

      {group.challenge && (
        <p className="text-sm text-gray-600 mb-4">{group.challenge}</p>
      )}

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">
          {group.isPrivate ? 'Grupo Privado' : 'Grupo Público'}
        </span>

        {isMyGroup && (
          <>
            {isApproved && (
              <span className="text-green-600 font-medium">Ativo</span>
            )}
            {isPending && (
              <span className="px-3 py-1 font-medium bg-yellow-100 text-yellow-800 rounded">
                Pendente
              </span>
            )}
          </>
        )}
        {!isMyGroup && (
          <button
            onClick={() => onJoinRequest?.(group.groupId)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 hover:cursor-pointer transition-colors"
          >
            <Send className="w-3 h-3" />
            Entrar
          </button>
        )}
      </div>

      {isMyGroup && (
        <Button
          className="w-full mt-4"
          type="button"
          variant="danger"
          onClick={() => {
            if (isAdmin) {
              onDeleteGroup?.(group.groupId)
            } else {
              onExitGroup?.(group.groupId)
            }
          }}
        >
          {isAdmin ? 'Apagar' : isPending ? 'Cancelar solicitacao' : 'Sair'}
        </Button>
      )}
    </div>
  )
}
