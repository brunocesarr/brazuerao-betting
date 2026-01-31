import { prisma } from '@/lib/prisma'
import { UserProfile } from '@/types/domain'
import { hash } from 'bcryptjs'

// MARK: - User
export const existsUser = async ({
  id,
  email,
}: {
  id?: string | null
  email?: string | null
}): Promise<boolean> => {
  try {
    if (!id && !email) {
      return false
    }

    const user = await prisma.user.findUnique({
      where: id ? { id } : { email: email! },
    })
    return user != null
  } catch (error) {
    console.error('Get user error:', error)
    return false
  }
}

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  return user as UserProfile
}

export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const hashedPassword = await hash(password, 12)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    }
  } catch (error) {
    console.error('Create user error:', error)
    throw error
  }
}
