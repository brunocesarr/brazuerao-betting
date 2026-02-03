'use client'

import { usePathname } from 'next/navigation'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const pathname = usePathname()

  // Hide footer on certain pages if needed
  const hideFooter =
    pathname?.includes('/login') || pathname?.includes('/register')

  if (hideFooter) return null

  return (
    <footer className="relative bottom-0 w-full from-primary-700 flex justify-center bg-gradient-to-b to-black px-4 py-6 text-white md:justify-end">
      <div className="text-center text-sm text-white md:text-right">
        <p>
          © {currentYear}{' '}
          <span className="font-semibold text-white">Brazuerão</span>. Todos os
          direitos reservados.
        </p>
        <p className="mt-1 text-xs text-white/70">
          Feito para os amantes do futebol brasileiro
        </p>
      </div>
    </footer>
  )
}
