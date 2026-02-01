import { GroupTabType } from '@/types/domain'
import { Search, Users } from 'lucide-react'

interface TabNavigationProps {
  activeTab: GroupTabType
  onTabChange: (tab: GroupTabType) => void
  myGroupsCount: number
}

export default function TabNavigation({
  activeTab,
  onTabChange,
  myGroupsCount,
}: TabNavigationProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-2">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => onTabChange('my-groups')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors hover:cursor-pointer ${
              activeTab === 'my-groups'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Meus Grupos ({myGroupsCount})
            </div>
          </button>
          <button
            onClick={() => onTabChange('find-groups')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors hover:cursor-pointer ${
              activeTab === 'find-groups'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Procurar Grupos
            </div>
          </button>
        </nav>
      </div>
    </div>
  )
}
