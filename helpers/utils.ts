import { prisma } from '@/lib/prisma'

const existsUser = async (id?: string): Promise<boolean> => {
  try {
    if (!id) return false

    const user = await prisma.user.findUnique({
      where: { id },
    })
    if (!user) {
      throw new Error('User not found')
    }
    return true
  } catch (error) {
    console.error('Get user error:', error)
    return false
  }
}

export { existsUser }
