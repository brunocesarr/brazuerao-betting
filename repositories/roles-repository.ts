import { DefaultValues } from '@/helpers/constants'
import { prisma } from '@/lib/prisma'

// MARK: - Group Role
export const getAllGroupRoles = async () => {
  try {
    if (DefaultValues.groupRoles.length > 0) {
      DefaultValues.adminGroupRule = DefaultValues.groupRoles.find(
        (rule) => rule.name.toUpperCase() === 'ADMIN'
      )
      return DefaultValues.groupRoles
    }
    const roles = await prisma.roleGroup.findMany()
    DefaultValues.groupRoles = roles
    DefaultValues.adminGroupRule = roles.find(
      (rule) => rule.name.toUpperCase() === 'ADMIN'
    )
    return roles
  } catch (error) {
    console.error('Get roles error:', error)
    return []
  }
}
