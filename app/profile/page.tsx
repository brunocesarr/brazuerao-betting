// src/app/profile/page.tsx

'use client'

import { ProfileForm } from '@/components/profile/ProfileForm'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton'
import { Button } from '@/components/ui/Button'
import { useProfile } from '@/lib/hooks/useProfile'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilePage() {
  const router = useRouter()
  const { status } = useSession()
  const {
    user,
    userGroups,
    isLoading,
    isUpdating,
    fetchProfile,
    updateProfile,
  } = useProfile()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

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
              isUpdating={isUpdating}
            />
          </div>

          <div className="flex flex-col rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-black">Grupos</h2>
            {userGroups.length > 0 ? (
              userGroups.map((userGroup) => (
                <p className="text-sm font-thin">{userGroup.name}</p>
              ))
            ) : (
              <>
                <p className="text-sm font-thin">
                  Voce ainda nao tem grupos cadastrados ou faz parte de um. Crie
                  já seu grupo de aposta ou peca para entrar em um existente.
                </p>

                <div className="flex flex-col md:flex-row justify-around gap-2 mt-8">
                  <Button
                    type="button"
                    variant="secondary"
                    // onClick={}
                  >
                    Criar um grupo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    // onClick={}
                  >
                    Procurar um grupo
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
