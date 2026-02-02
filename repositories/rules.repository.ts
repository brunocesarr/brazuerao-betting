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

export const getAllBetRulesByGroupId = async (
  groupId: string
): Promise<BetRuleDBModel[]> => {
  try {
    const rules = await prisma.scoringRuleBetGroup.findMany({
      where: {
        groupId: groupId,
      },
      include: {
        scoringRule: {},
      },
    })

    return rules.map((rule) => ({
      ...rule.scoringRule,
      ranges:
        typeof rule.scoringRule.ranges === 'string'
          ? JSON.parse(rule.scoringRule.ranges)
          : rule.scoringRule.ranges,
    }))
  } catch (error) {
    console.error('Get all bet rules error:', error)
    return []
  }
}
