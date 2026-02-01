import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const PROTECTED_ROUTES = ['/betting', '/user'] as const

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/leaderboard',
  '/rules',
] as const

// ============================================================================
// MIDDLEWARE
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl

  // Debug log
  console.log('🔍 [Middleware] Verificando:', pathname)

  // 1. Pular rotas de API
  if (pathname.startsWith('/api')) {
    console.log('⏭️  [API] Permitido')
    return NextResponse.next()
  }

  // 2. Pular arquivos estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)
  ) {
    console.log('⏭️  [Static] Permitido')
    return NextResponse.next()
  }

  // 3. Verificar se é rota pública
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  if (isPublicRoute) {
    console.log('✅ [Public] Permitido:', pathname)
    return NextResponse.next()
  }

  // 4. Verificar se é rota protegida
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  if (!isProtectedRoute) {
    console.log('✅ [Default] Permitido:', pathname)
    return NextResponse.next()
  }

  // 5. ROTA PROTEGIDA - Verificar autenticação
  console.log('🔒 [Protected] Verificando autenticação:', pathname)

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      console.log('❌ [Redirect] Sem token, redirecionando para login')

      const loginUrl = new URL('/login', origin)
      loginUrl.searchParams.set('callbackUrl', pathname)

      return NextResponse.redirect(loginUrl)
    }

    console.log('✅ [Authenticated] Usuário autenticado:', token.email)
    return NextResponse.next()
  } catch (error) {
    console.error('❌ [Error] Erro ao verificar token:', error)

    const loginUrl = new URL('/login', origin)
    return NextResponse.redirect(loginUrl)
  }
}

// ============================================================================
// MATCHER
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - files with extensions
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).+)',
  ],
}
