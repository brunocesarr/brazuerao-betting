'use client'

import { Button } from '@/components/shared/Button'
import { DefaultValues, RequestStatusEnum } from '@/constants/constants'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useConfirmDialog } from '@/lib/contexts/DialogContext'
import { CurrentRequestBetGroup, UserBetGroup } from '@/types/domain'
import { useEffect, useState } from 'react'
import CreateGroupModal from './CreateGroupModal'

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

export default function MyGroupRequestTable({
  userBetGroup,
  onUpdateGroupInfo,
}: MyGroupRequestTableProps) {
  const { confirm } = useConfirmDialog()
  const { getCurrentRequests, handleCurrentRequest } = useAuth()

  const [requests, setRequests] = useState<CurrentRequestBetGroup[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false)

  const handleCurrentRequests = async () => {
    setIsLoading(true)
    setRequests([])
    const requests = await getCurrentRequests(userBetGroup.groupId)
    setRequests(requests)
    setIsLoading(false)
  }

  useEffect(() => {
    setRequests([])
    if (userBetGroup) {
      handleCurrentRequests()
    }
  }, [userBetGroup])

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date))
  }

  const getStatusBadge = (request: CurrentRequestBetGroup) => {
    if (isAdmin(request))
      return <span className="text-sm text-gray-400">—</span>

    const statusMap = {
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

    const statusInfo = statusMap[
      request.requestStatusDescription as RequestStatusEnum
    ] || {
      label: request.requestStatusDescription,
      className: 'bg-gray-100 text-gray-800',
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
      >
        {statusInfo.label.toUpperCase()}
      </span>
    )
  }

  const handleApprove = async (request: CurrentRequestBetGroup) => {
    const result = await confirm({
      title: 'Aprovar Solicitação',
      message: `Tem certeza que deseja aprovar a solicitação de ${request.username}?`,
      confirmText: 'Aprovar',
      cancelText: 'Cancelar',
      variant: 'info',
    })

    if (result) {
      const approvedRequestStatusId = DefaultValues.approvedRequestStatus?.id
      if (!approvedRequestStatusId) return
      setIsLoading(true)
      await handleCurrentRequest(
        request.userId,
        request.groupId,
        approvedRequestStatusId
      )
      await handleCurrentRequests()
      setIsLoading(false)
    }
  }

  const handleReject = async (request: CurrentRequestBetGroup) => {
    const result = await confirm({
      title: 'Rejeitar Solicitação',
      message: `Tem certeza que deseja rejeitar a solicitação de ${request.username}?`,
      confirmText: 'Rejeitar',
      cancelText: 'Cancelar',
      variant: 'danger',
    })

    if (result) {
      const rejectRequestStatusId = DefaultValues.requestStatus.find(
        (status) => status.status === RequestStatusEnum.rejected
      )?.id
      if (!rejectRequestStatusId) return
      setIsLoading(true)
      await handleCurrentRequest(
        request.userId,
        request.groupId,
        rejectRequestStatusId
      )
      await handleCurrentRequests()
      setIsLoading(false)
    }
  }

  const handleRemove = async (request: CurrentRequestBetGroup) => {
    const result = await confirm({
      title: 'Remover participante',
      message: `Tem certeza que deseja remover o participante ${request.username}?`,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      variant: 'danger',
    })

    if (result) {
      const rejectRequestStatusId = DefaultValues.requestStatus.find(
        (status) => status.status === RequestStatusEnum.rejected
      )?.id
      if (!rejectRequestStatusId) return
      setIsLoading(true)
      await handleCurrentRequest(
        request.userId,
        request.groupId,
        rejectRequestStatusId
      )
      await handleCurrentRequests()
      setIsLoading(false)
    }
  }

  const isApproved = (request: CurrentRequestBetGroup) => {
    if (!request.requestStatusId) return false
    else if (!DefaultValues.approvedRequestStatus?.id) return false
    return request.requestStatusId === DefaultValues.approvedRequestStatus?.id
  }

  const isPending = (request: CurrentRequestBetGroup) => {
    if (!request.requestStatusId) return false
    else if (!DefaultValues.pendingRequestStatus?.id) return false
    return request.requestStatusId === DefaultValues.pendingRequestStatus?.id
  }

  const isAdmin = (request: CurrentRequestBetGroup) => {
    if (!isApproved(request)) return false
    return (
      request.groupId === userBetGroup.groupId &&
      request.userId === userBetGroup.userId
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex justify-center items-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
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
          Nenhuma solicitação
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Não há solicitações de entrada no grupo.
        </p>
      </div>
    )
  }

  const pendingRequests = requests.filter((req) => isPending(req))

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

      <div>
        <div className="flex flex-col md:flex-row justify-between space-y-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Grupo: {userBetGroup.name.toUpperCase()}
            </h2>
            <h2 className="text-xs font-thin text-gray-900">
              {new Date(userBetGroup.deadlineAt).getTime() <=
              new Date().getTime()
                ? 'Apostas encerradas!'
                : 'Aceitando apostas até ' +
                  new Date(userBetGroup.deadlineAt).toLocaleDateString(
                    'pt-BR',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
            </h2>
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
        <p className="font-thin text-sm text-gray-600 mt-1">
          Aceite ou rejeite participantes para o seu grupo. Você pode também
          remover, caso precise.
        </p>
        {pendingRequests.length > 0 && (
          <p className="mt-2 text-sm text-yellow-600/90">
            {pendingRequests.length} solicitação(ões) pendente(s)
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data da Solicitação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr
                  key={request.userId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {request.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            {request.username}
                          </div>
                          {isAdmin(request) && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-primary-300 text-white rounded">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {!isApproved(request) ? (
                      <div className="text-sm text-gray-900">
                        {formatDate(request.createdAt)}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isPending(request) ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          className="text-xs font-medium"
                          type="button"
                          variant="primary"
                          onClick={() => handleApprove(request)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <svg
                              className="animate-spin h-4 w-4"
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
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 mr-1"
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
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <svg
                              className="animate-spin h-4 w-4"
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
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 mr-1"
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
                    ) : isApproved(request) && !isAdmin(request) ? (
                      <Button
                        className="text-xs font-medium"
                        type="button"
                        variant="danger"
                        onClick={() => handleRemove(request)}
                      >
                        <svg
                          className="w-4 h-4 mr-1"
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
                      <span className="text-gray-400 text-xs">—</span>
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
