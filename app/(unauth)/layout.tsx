'use client'

import { useRequireAuth } from '@/lib/hooks/useRequireAuth'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useRequireAuth({ redirectTo: '/user/profile', redirectIfFound: true })
  return children
}
