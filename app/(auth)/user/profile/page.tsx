// src/app/profile/page.tsx

'use client'

import { Button } from '@/components/ui/Button'
import { ProfileForm } from '@/components/user/profile/ProfileForm'
import { ProfileHeader } from '@/components/user/profile/ProfileHeader'
import { ProfileSkeleton } from '@/components/user/profile/ProfileSkeleton'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const { user, userGroups, isLoading, updateProfile } = useAuth()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <ProfileSkeleton />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <p className="text-red-800">Failed to load profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1a1a1a]">
      <div className="min-h-screen mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Conta</h1>
          <p className="mt-1 text-white/70">
            Gerencie suas informacoes de conta
          </p>
        </div>

        <div className="space-y-6">
          <ProfileHeader user={user} />

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-black">
              Informacoes da conta
            </h2>
            <ProfileForm
              user={user}
              onSubmit={updateProfile}
              isUpdating={isLoading}
            />
          </div>

          <div className="flex flex-col rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-black">
              Meus Grupos
            </h2>
            {userGroups.length > 0 ? (
              userGroups.map((userGroup, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-50/80 rounded-md border border-gray-100"
                >
                  <p className="text-sm font-bold">{userGroup.name}</p>
                  {userGroup.challenge && (
                    <p className="text-sm font-thin">{userGroup.challenge}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm font-thin">
                Voce ainda nao tem grupos cadastrados ou faz parte de um. Crie
                já seu grupo de aposta ou peca para entrar em um existente.
              </p>
            )}
            <div className="flex flex-col md:flex-row justify-around gap-2 mt-8">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/user/groups')}
              >
                Criar um grupo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push('/user/groups?activeTab=find-groups')
                }
              >
                Procurar um grupo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
