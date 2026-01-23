import { getUserById } from '@/repositories/brazuerao.repository'
import { compare } from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          throw new Error('Usuário não encontrado')
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Senha inválida')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }

      if (trigger === 'update' && session) {
        token.name = session.name
        return {
          ...token,
          ...session,
        }
      }

      if (token.id) {
        const dbUser = await getUserById(token.id as string)
        if (dbUser) {
          token.name = dbUser.name
          token.email = dbUser.email
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }

      return session
    },
  },
}
