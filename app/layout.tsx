import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: `Brazuerao Apostas - ${new Date().getFullYear()}`,
  description: 'Bet on the final standings of Brasileirão Serie A 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-lt-installed="true"
      data-scroll-behavior="smooth"
      className="bg-primary-700"
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
