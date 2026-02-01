'use client'

import { Group, Menu, X } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface NavLink {
  href: string
  label: string
  icon: string
  show: boolean
}

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const isActive = (path: string) => pathname === path

  const navLinks: NavLink[] = [
    {
      href: '/leaderboard',
      label: 'Classificação',
      icon: '🏆',
      show: true,
    },
    {
      href: '/betting',
      label: 'Minhas Apostas',
      icon: '⚽',
      show: !!session,
    },
  ]

  const userMenuItems = [
    {
      href: '/user/profile',
      label: 'Perfil',
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      href: '/user/groups',
      label: 'Grupos',
      icon: <Group className="h-4 w-4" />,
    },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-primary-50 bg-primary-700 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="group flex flex-shrink-0 items-center space-x-2 md:space-x-3"
          >
            <div className="overflow-hidden rounded-lg border border-transparent bg-gradient-to-br from-transparent to-primary-50/20 p-1 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
              <div className="relative h-10 w-10 md:h-12 md:w-12">
                <Image
                  src="/logo.ico"
                  alt="Logo do Brasileirão"
                  priority
                  fill
                  sizes="(min-width: 768px) 48px, 40px"
                />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white md:text-xl">
                Brazuerao
              </h1>
              <p className="-mt-1 text-xs font-semibold text-primary-50">
                {new Date().getFullYear()}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-2 lg:flex">
            {navLinks.map(
              (link) =>
                link.show && (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 rounded-md px-4 py-2 font-medium text-white transition-all duration-200 ${
                      isActive(link.href) ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                )
            )}

            {session ? (
              <div className="ml-4 flex items-center border-l-2 border-white/20 pl-4">
                <div className="relative" ref={menuRef}>
                  <button
                    className="flex items-center space-x-2 transition-opacity hover:opacity-80"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-label="Menu do usuário"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-400 font-semibold text-white shadow-md">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <svg
                      className={`h-4 w-4 text-white transition-transform duration-200 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 animate-in fade-in slide-in-from-top-2 rounded-lg border border-gray-200 bg-white py-1 shadow-lg duration-200">
                      <div className="border-b border-gray-200 px-4 py-3">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {session.user?.name}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {session.user?.email}
                        </p>
                      </div>

                      {userMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 ${
                            isActive(item.href) ? 'bg-gray-100' : ''
                          }`}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}

                      <div className="border-t border-gray-200"></div>

                      <button
                        onClick={() => signOut()}
                        className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-primary-500/40 px-6 py-2 font-medium text-white transition-all duration-200 hover:bg-white/20"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded-md p-2 text-white transition-colors hover:bg-white/10 lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu de navegação"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="animate-in slide-in-from-top border-t border-primary-50/20 py-4 duration-200 lg:hidden">
            <div className="flex flex-col space-y-1">
              {/* Navigation Links */}
              {navLinks.map(
                (link) =>
                  link.show && (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 rounded-md px-4 py-3 font-medium text-white transition-all duration-200 ${
                        isActive(link.href)
                          ? 'bg-white/20'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  )
              )}

              {session ? (
                <>
                  {/* User Info */}
                  <div className="my-2 border-t border-primary-50/20"></div>
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-white">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-primary-50">
                      {session.user?.email}
                    </p>
                  </div>

                  {/* User Menu Items */}
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-md px-4 py-3 text-white transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-white/20'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  {/* Logout Button */}
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 rounded-md px-4 py-3 text-red-300 transition-all duration-200 hover:bg-red-500/20"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Sair</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="mx-4 rounded-md bg-white/10 px-4 py-3 text-center font-medium text-white transition-all duration-200 hover:bg-white/20"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
