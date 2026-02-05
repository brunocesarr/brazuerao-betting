'use client'

import { Button } from '@/components/shared/Button'
import { DefaultValues, RequestStatusEnum } from '@/constants/constants'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useConfirmDialog } from '@/lib/contexts/DialogContext'
import { CurrentRequestBetGroup, UserBetGroup } from '@/types/domain'
import { useCallback, useEffect, useState, useTransition } from 'react'
import CreateGroupModal from './CreateGroupModal'

// ============================================================================
// TYPES
// ============================================================================

interface MyGroupRequestTableProps {
  userBetGroup: UserBetGroup
  onUpdateGroupInfo: (
    group: Omit<
      UserBetGroup,
      'groupId' | 'userId' | 'roleGroupId' | 'requestStatusId'
    >,
    rules: string[]
  ) => void
}

interface StatusInfo {
  label: string
  className: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_MAP: Record<RequestStatusEnum, StatusInfo> = {
  [RequestStatusEnum.approved]: {
    label: 'Aprovado',
    className: 'bg-green-100 text-green-800',
  },
  [RequestStatusEnum.rejected]: {
    label: 'Rejeitado',
    className: 'bg-red-100 text-red-800',
  },
  [RequestStatusEnum.pending]: {
    label: 'Pendente',
    className: 'bg-yellow-100 text-yellow-800',
  },
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function MyGroupRequestTable({
  userBetGroup,
  onUpdateGroupInfo,
}: MyGroupRequestTableProps) {
  const { confirm } = useConfirmDialog()
  const { getCurrentRequests, handleCurrentRequest } = useAuth()

  const [requests, setRequests] = useState<CurrentRequestBetGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpenEditModal, setIsOpenEditModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Fetch current requests for the group
   */
  const fetchCurrentRequests = useCallback(async () => {
    if (!userBetGroup?.groupId) return

    try {
      setIsLoading(true)
      const fetchedRequests = await getCurrentRequests(userBetGroup.groupId)
      setRequests(fetchedRequests)
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      setRequests([])
    } finally {
      setIsLoading(false)
    }
  }, [userBetGroup?.groupId, getCurrentRequests])

  /**
   * Handle approve request
   */
  const handleApprove = async (request: CurrentRequestBetGroup) => {
    const approved = await confirm({
      title: 'Aprovar Solicitação',
      message: `Tem certeza que deseja aprovar a solicitação de ${request.username}?`,
      confirmText: 'Aprovar',
      cancelText: 'Cancelar',
      variant: 'info',
    })

    if (!approved) return

    const approvedStatusId = DefaultValues.approvedRequestStatus?.id
    if (!approvedStatusId) {
      console.error('Approved status ID not found')
      return
    }

    startTransition(async () => {
      setIsLoading(true)
      try {
        await handleCurrentRequest(
          request.userId,
          request.groupId,
          approvedStatusId
        )
        await fetchCurrentRequests()
      } finally {
        setIsLoading(false)
      }
    })
  }

  /**
   * Handle reject request
   */
  const handleReject = async (request: CurrentRequestBetGroup) => {
    const rejected = await confirm({
      title: 'Rejeitar Solicitação',
      message: `Tem certeza que deseja rejeitar a solicitação de ${request.username}?`,
      confirmText: 'Rejeitar',
      cancelText: 'Cancelar',
      variant: 'danger',
    })

    if (!rejected) return

    const rejectStatusId = DefaultValues.requestStatus.find(
      (status) => status.status === RequestStatusEnum.rejected
    )?.id

    if (!rejectStatusId) {
      console.error('Reject status ID not found')
      return
    }

    startTransition(async () => {
      setIsLoading(true)
      try {
        await handleCurrentRequest(
          request.userId,
          request.groupId,
          rejectStatusId
        )
        await fetchCurrentRequests()
      } finally {
        setIsLoading(false)
      }
    })
  }

  /**
   * Handle remove participant
   */
  const handleRemove = async (request: CurrentRequestBetGroup) => {
    const removed = await confirm({
      title: 'Remover Participante',
      message: `Tem certeza que deseja remover o participante ${request.username}?`,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      variant: 'danger',
    })

    if (!removed) return

    const rejectStatusId = DefaultValues.requestStatus.find(
      (status) => status.status === RequestStatusEnum.rejected
    )?.id

    if (!rejectStatusId) {
      console.error('Reject status ID not found')
      return
    }

    startTransition(async () => {
      setIsLoading(true)
      try {
        await handleCurrentRequest(
          request.userId,
          request.groupId,
          rejectStatusId
        )
        await fetchCurrentRequests()
      } finally {
        setIsLoading(false)
      }
    })
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date))
  }

  const isRequestApproved = (request: CurrentRequestBetGroup) => {
    return request.requestStatusId === DefaultValues.approvedRequestStatus?.id
  }

  const isRequestPending = (request: CurrentRequestBetGroup) => {
    return request.requestStatusId === DefaultValues.pendingRequestStatus?.id
  }

  const isRequestAdmin = (request: CurrentRequestBetGroup) => {
    if (!isRequestApproved(request)) return false
    return (
      request.groupId === userBetGroup.groupId &&
      request.userId === userBetGroup.userId
    )
  }

  const getStatusBadge = (request: CurrentRequestBetGroup) => {
    if (isRequestAdmin(request)) {
      return <span className="text-sm text-gray-400">—</span>
    }

    const statusInfo = STATUS_MAP[
      request.requestStatusDescription as RequestStatusEnum
    ] || {
      label: request.requestStatusDescription,
      className: 'bg-gray-100 text-gray-800',
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.className}`}
      >
        {statusInfo.label.toUpperCase()}
      </span>
    )
  }

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Fetch requests when group changes
   * Uses startTransition to avoid cascading renders
   */
  useEffect(() => {
    if (userBetGroup?.groupId) {
      startTransition(() => {
        fetchCurrentRequests()
      })
    }
  }, [userBetGroup?.groupId, fetchCurrentRequests])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const pendingRequests = requests.filter(isRequestPending)
  const isDeadlinePassed =
    new Date(userBetGroup.deadlineAt).getTime() <= new Date().getTime()

  // ============================================================================
  // RENDER - LOADING STATE
  // ============================================================================

  if (isLoading && requests.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 shadow">
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="h-10 w-10 animate-spin text-primary-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm text-gray-600">Carregando solicitações...</p>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER - EMPTY STATE
  // ============================================================================

  if (!isLoading && requests.length === 0) {
    return (
      <div className="space-y-6">
        <CreateGroupModal
          rules={[]}
          isOpen={isOpenEditModal}
          mode="edit"
          onClose={() => setIsOpenEditModal(false)}
          existingGroup={userBetGroup}
          onSubmit={onUpdateGroupInfo}
        />

        <div className="rounded-lg bg-white p-8 text-center shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Nenhuma Solicitação
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Não há solicitações de entrada no grupo.
          </p>
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER - TABLE
  // ============================================================================

  return (
    <div className="space-y-6">
      <CreateGroupModal
        rules={[]}
        isOpen={isOpenEditModal}
        mode="edit"
        onClose={() => setIsOpenEditModal(false)}
        existingGroup={userBetGroup}
        onSubmit={onUpdateGroupInfo}
      />

      {/* Header */}
      <div>
        <div className="flex flex-col justify-between space-y-2 md:flex-row md:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Grupo: {userBetGroup.name.toUpperCase()}
            </h2>
            <p className="text-xs font-thin text-gray-900">
              {isDeadlinePassed
                ? 'Apostas encerradas!'
                : `Aceitando apostas até ${new Date(
                    userBetGroup.deadlineAt
                  ).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
            </p>
          </div>
          <Button
            className="text-xs font-medium"
            type="button"
            variant="primary"
            onClick={() => setIsOpenEditModal(true)}
          >
            Editar
          </Button>
        </div>
        <p className="mt-1 text-sm font-thin text-gray-600">
          Aceite ou rejeite participantes para o seu grupo. Você pode também
          remover, caso precise.
        </p>
        {pendingRequests.length > 0 && (
          <p className="mt-2 text-sm text-yellow-600">
            {pendingRequests.length} solicitação(ões) pendente(s)
          </p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell">
                  Data da Solicitação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {requests
                .sort((a, b) =>
                  (a.username || '').localeCompare(b.username || '')
                )
                .map((request) => (
                  <tr
                    key={`${request.userId}-${request.groupId}`}
                    className="transition-colors hover:bg-gray-50"
                  >
                    {/* User Info */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                          <span className="text-sm font-medium text-gray-600">
                            {request.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">
                              {request.username}
                            </div>
                            {isRequestAdmin(request) && (
                              <span className="rounded bg-primary-300 px-2 py-0.5 text-xs font-medium text-white">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.email}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
                      {isRequestApproved(request) ? (
                        <span className="text-sm text-gray-400">—</span>
                      ) : (
                        <div className="text-sm text-gray-900">
                          {formatDate(request.createdAt)}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(request)}
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      {isRequestPending(request) ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            className="text-xs font-medium"
                            type="button"
                            variant="primary"
                            onClick={() => handleApprove(request)}
                            disabled={isLoading || isPending}
                          >
                            {isLoading || isPending ? (
                              <svg
                                className="h-4 w-4 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                            ) : (
                              <>
                                <svg
                                  className="mr-1 h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Aprovar
                              </>
                            )}
                          </Button>
                          <Button
                            className="text-xs font-medium"
                            type="button"
                            variant="danger"
                            onClick={() => handleReject(request)}
                            disabled={isLoading || isPending}
                          >
                            {isLoading || isPending ? (
                              <svg
                                className="h-4 w-4 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                            ) : (
                              <>
                                <svg
                                  className="mr-1 h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Rejeitar
                              </>
                            )}
                          </Button>
                        </div>
                      ) : isRequestApproved(request) &&
                        !isRequestAdmin(request) ? (
                        <Button
                          className="text-xs font-medium"
                          type="button"
                          variant="danger"
                          onClick={() => handleRemove(request)}
                          disabled={isLoading || isPending}
                        >
                          <svg
                            className="mr-1 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Remover
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
