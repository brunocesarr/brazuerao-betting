import { prisma } from '@/lib/prisma'
import { BetRuleDBModel } from '@/types/entities'

// MARK: - Rules
export const getAllBetRules = async (): Promise<BetRuleDBModel[]> => {
  try {
    const rules = await prisma.scoringRule.findMany({
      where: {
        isActive: true,
      },
    })
    return rules.map((rule) => ({
      ...rule,
      ranges:
        typeof rule.ranges === 'string' ? JSON.parse(rule.ranges) : rule.ranges,
    }))
  } catch (error) {
    console.error('Get all bet rules error:', error)
    return []
  }
}
