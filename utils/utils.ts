import { prisma } from '@/lib/prisma'

const existsUser = async (id?: string): Promise<boolean> => {
  try {
    if (!id) return false

    const user = await prisma.user.findUnique({
      where: { id },
    })
    if (!user) {
      throw new Error('Usuário não encontrado')
    }
    return true
  } catch (error) {
    console.error('Erro ao obter usuário:', error)
    return false
  }
}

export { existsUser }
