'use client'

import { Group } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (menuRef.current && !menuRef.current.contains(event?.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-primary-700 border-primary-50 fixed sticky top-0 z-50 border-b-1 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-3">
            <div className="to-primary-50/20 transform overflow-hidden rounded-lg border-1 border-transparent bg-gradient-to-br from-transparent bg-clip-border p-1 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <div className="relative h-12 w-12">
                <Image
                  src="/logo.ico"
                  className="logo"
                  alt="Logo do Brasileirão"
                  priority
                  fill
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADA..."
                  sizes="(min-width: 60em) 24vw,
                        (min-width: 28em) 45vw,
                        100vw"
                />
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="text-xl font-bold text-white">Brazuerao</div>
              <div className="text-primary-50 -mt-1 text-xs font-semibold">
                {new Date().getFullYear()}
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            <Link
              href="/leaderboard"
              className={`hidden rounded-md px-4 py-2 font-medium text-white transition-all duration-200 lg:flex lg:flex-row lg:gap-2 ${
                isActive('/leaderboard')
                  ? 'border-b-2 border-white'
                  : 'hover:bg-gray-100/30'
              }`}
            >
              <p>🏆</p>
              <p>Classificação</p>
            </Link>

            {session ? (
              <>
                <Link
                  href="/betting"
                  className={`flex flex-row gap-2 rounded-md px-4 py-2 font-medium text-white transition-all duration-200 ${
                    isActive('/betting')
                      ? 'border-b-2 border-white'
                      : 'hover:bg-gray-100/30'
                  }`}
                >
                  <p>⚽</p>
                  <p>Minhas Apostas</p>
                </Link>

                <div className="relative ml-4 flex items-center space-x-3 border-l-2 border-gray-200 pl-4">
                  <div className="relative" ref={menuRef}>
                    <div
                      className="flex cursor-pointer items-center space-x-2 transition-opacity hover:opacity-80"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                      <div className="to-primary-400 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-transparent font-semibold text-white shadow-md">
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <svg
                        className={`h-4 w-4 text-white transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
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
                    </div>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div className="animate-in fade-in slide-in-from-top-2 absolute top-full right-0 z-50 mt-2 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg duration-200">
                        <div className="border-b border-gray-200 px-4 py-3">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {session.user?.name}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {session.user?.email}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <Link
                          href="/user/profile"
                          className={`block flex flex-row items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 ${
                            isActive('/user/profile') ? 'bg-gray-200' : ''
                          }`}
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
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Perfil
                        </Link>

                        {/* Menu Items */}
                        <Link
                          href="/user/groups"
                          className={`block flex flex-row items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 ${
                            isActive('/user/groups') ? 'bg-gray-200' : ''
                          }`}
                        >
                          <Group className="mr-2 h-4 w-4" />
                          Grupos
                        </Link>

                        <div className="my-0 border-t border-gray-200"></div>

                        {/* Logout Button */}
                        <button
                          onClick={() => signOut()}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          <div className="flex items-center hover:cursor-pointer">
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
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn-primary rounded-lg px-4 py-2 font-medium text-white transition-all duration-200"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
