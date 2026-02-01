import { LeaderboardProvider } from '@/lib/contexts/LeaderboardContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <LeaderboardProvider>{children}</LeaderboardProvider>
}
