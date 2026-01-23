import { UserProfile as User } from '@/types'
import { UserCircleIcon } from 'lucide-react'

interface ProfileHeaderProps {
  user: User
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white shadow-lg">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
        <UserCircleIcon className="h-12 w-12" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-white-100/50">{user.email}</p>
        <p className="mt-1 text-sm text-white-100/70">
          Membro desde {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
