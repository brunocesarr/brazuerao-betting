// src/app/profile/page.tsx

'use client'

import { ProfileForm } from '@/components/profile/ProfileForm'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton'
import { useProfile } from '@/lib/hooks/useProfile'
import { useEffect } from 'react'

export default function ProfilePage() {
  const { user, isLoading, isUpdating, fetchProfile, updateProfile } =
    useProfile()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

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
        </div>
      </div>
    </div>
  )
}
