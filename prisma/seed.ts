import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const initialRequestStatuses = [
  { status: 'PENDING' },
  { status: 'APPROVED' },
  { status: 'REJECTED' },
]

const roleGroups = [{ name: 'ADMIN' }, { name: 'USER' }, { name: 'ROOT' }]

const betRules = [
  {
    ruleType: 'EXACT_CHAMPION',
    description: 'Acertar o campeão',
    points: 3,
    priority: 1,
  },
  {
    ruleType: 'EXACT_POSITION',
    description: 'Acertar a posição exata de um time na tabela',
    points: 2,
    priority: 2,
  },
  {
    ruleType: 'ZONE_MATCH',
    description: 'Acertar se um time ficará em uma zona especifica da tabela',
    points: 1,
    priority: 3,
    ranges: [
      { rangeStart: 1, rangeEnd: 4 }, // Zona de classificação
      { rangeStart: 5, rangeEnd: 16 }, // Zona intermediária
      { rangeStart: 17, rangeEnd: 20 }, // Zona de rebaixamento
    ],
  },
]

const requestStatusSeed = async () => {
  for (const requestStatus of initialRequestStatuses) {
    const data = await prisma.requestStatus.findFirst({
      where: { status: requestStatus.status },
    })

    if (data) {
      await prisma.requestStatus.update({
        where: { id: data.id },
        data: requestStatus,
      })
    } else {
      await prisma.requestStatus.create({
        data: requestStatus,
      })
    }
  }
}

const roleGroupSeed = async () => {
  for (const roleGroup of roleGroups) {
    const data = await prisma.roleGroup.findFirst({
      where: { name: roleGroup.name },
    })

    if (data) {
      await prisma.roleGroup.update({
        where: { id: data.id },
        data: roleGroup,
      })
    } else {
      await prisma.roleGroup.create({
        data: roleGroup,
      })
    }
  }
}

const betRulesSeed = async () => {
  for (const betRule of betRules) {
    const data = await prisma.scoringRule.findFirst({
      where: { description: betRule.description },
    })

    if (data) {
      await prisma.scoringRule.update({
        where: { id: data.id },
        data: {
          ...betRule,
          ranges: JSON.stringify(betRule.ranges),
        },
      })
    } else {
      await prisma.scoringRule.create({
        data: {
          ...betRule,
          ranges: JSON.stringify(betRule.ranges),
        },
      })
    }
  }
}

const seed = async () => {
  await requestStatusSeed()
  await roleGroupSeed()
  await betRulesSeed()
}

seed()
