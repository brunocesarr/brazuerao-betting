'use client'

import CreateGroupModal from '@/components/user/groups/CreateGroupModal'
import EmptyState from '@/components/user/groups/EmptyState'
import FindGroupsTab from '@/components/user/groups/FindGroupsTab'
import MyGroupRequestCards from '@/components/user/groups/MyGroupRequests'
import MyGroupsTab from '@/components/user/groups/MyGroupsTab'
import TabNavigation from '@/components/user/groups/TabNavigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useConfirmDialog } from '@/lib/contexts/DialogContext'
import { useToast } from '@/lib/contexts/ToastContext'
import {
  getAllBetGroups,
  getAllBetRules,
  getAllGroupRoles,
  getAllRequestStatus,
} from '@/services/brazuerao.service'
import { GroupTabType, RuleBet, UserBetGroup } from '@/types/domain'
import { Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function GroupManagementPage() {
  const {
    userGroups: myGroups,
    createNewGroup,
    updateGroupInfo,
    deleteGroup,
    joinGroup,
    isLoading: isLoadingAuth,
  } = useAuth()
  const { showToast } = useToast()
  const { confirm } = useConfirmDialog()

  const searchParams = useSearchParams()
  const activeTabParam: GroupTabType =
    (searchParams.get('activeTab') as GroupTabType) ?? 'my-groups'

  const [activeTab, setActiveTab] = useState<GroupTabType>(activeTabParam)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rules, setRules] = useState<RuleBet[]>([])
  const [availableGroups, setAvailableGroups] = useState<UserBetGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<UserBetGroup | null>()

  useEffect(() => {
    fetchRules()
  }, [])

  useEffect(() => {
    if (activeTab === 'find-groups') {
      fetchAvailableGroups()
      setSelectedGroup(null)
    } else if (activeTab === 'my-groups') {
      const { pathname } = window.location
      window.history.replaceState({}, '', pathname)
    }
  }, [activeTab])

  useEffect(() => {
    const groups = availableGroups.filter(
      (group) => !myGroups.some((myGroup) => myGroup.groupId === group.groupId)
    )
    setAvailableGroups(groups)
  }, [myGroups])

  const fetchAvailableGroups = async () => {
    try {
      setIsLoading(true)
      const groups = await getAllBetGroups()
      setAvailableGroups(
        groups.filter(
          (group) =>
            !myGroups.some((myGroup) => myGroup.groupId === group.groupId)
        )
      )
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Falha ao buscar grupos disponíveis'
      showToast({
        type: 'error',
        message: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRules = async () => {
    try {
      setIsLoading(false)
      const rules = await getAllBetRules()
      setRules(rules)
      await Promise.all([getAllGroupRoles(), getAllRequestStatus()])
    } catch (error) {
      console.error('Erro ao buscar regras:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGroup = async (
    groupData: Omit<
      UserBetGroup,
      'groupId' | 'userId' | 'roleGroupId' | 'requestStatusId'
    >,
    rules: string[]
  ) => {
    const result = await confirm({
      title: 'Atenção',
      message: `Prosseguir com a criação do novo Grupo ${groupData.name}?`,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      variant: 'info',
    })

    if (!result) return

    const newGroup = await createNewGroup({
      ...groupData,
      rules,
    })
    if (!newGroup) return
    setSelectedGroup(newGroup)
  }

  const handleUpdateGroupInfo = async (
    groupData: Omit<
      UserBetGroup,
      'groupId' | 'userId' | 'roleGroupId' | 'requestStatusId'
    >
  ) => {
    const result = await confirm({
      title: 'Atenção',
      message: `Prosseguir com a atualização das informações do Grupo ${groupData.name}?`,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      variant: 'info',
    })

    if (!result) return

    if (!selectedGroup) return
    const updatedGroup = await updateGroupInfo({
      ...groupData,
      groupId: selectedGroup.groupId,
    })
    if (!updatedGroup) return
    setSelectedGroup(updatedGroup)
  }

  const handleJoinRequest = async (groupId: string) => {
    await joinGroup(groupId)
  }

  const handleDeleteGroup = async (groupId: string) => {
    setSelectedGroup(null)
    await deleteGroup(groupId)
  }

  const filteredGroups = availableGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.challenge?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const loadingComponent = () => {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="border-primary-600 mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const contentTab = () => {
    return activeTab === 'my-groups' ? (
      <MyGroupsTab
        groups={myGroups}
        selectedGroupId={selectedGroup?.groupId}
        onCreateClick={() => setShowCreateModal(true)}
        onDeleteGroup={handleDeleteGroup}
        onSelectGroup={setSelectedGroup}
      />
    ) : availableGroups.length > 0 ? (
      <FindGroupsTab
        groups={filteredGroups}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onJoinRequest={handleJoinRequest}
      />
    ) : (
      <EmptyState
        icon={Search}
        title="Nenhum grupo disponível."
        description=""
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Grupos</h1>
          <p className="text-white/60">Gerencia seus grupos e descubra novos</p>
        </div>

        <div className="bg-white rounded-lg">
          {/* Tab Navigation */}
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            myGroupsCount={myGroups.length}
          />

          {/* Tab Content */}
          {isLoading || isLoadingAuth ? loadingComponent() : contentTab()}

          {/* Create Group Modal */}
          <CreateGroupModal
            rules={rules}
            isOpen={showCreateModal}
            mode="create"
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateGroup}
          />
        </div>

        {!(isLoading || isLoadingAuth) && selectedGroup && (
          <div className="mt-8 bg-white rounded-lg p-6">
            <MyGroupRequestCards
              userBetGroup={selectedGroup}
              onUpdateGroupInfo={handleUpdateGroupInfo}
            />
          </div>
        )}
      </div>
    </div>
  )
}
