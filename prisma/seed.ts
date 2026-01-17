import 'dotenv/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaBetterSqlite3({ url: connectionString })
const prisma = new PrismaClient({ adapter })

const initialRequestStatuses = [
  { status: 'PENDING' },
  { status: 'APPROVED' },
  { status: 'REJECTED' },
]

const roleGroups = [{ name: 'ADMIN' }, { name: 'USER' }]

const requestStatusSeed = async () => {
  for (const requestStatus of initialRequestStatuses) {
    let data = await prisma.requestStatus.findFirst({
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
    let data = await prisma.roleGroup.findFirst({
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

const seed = async () => {
  await requestStatusSeed()
  await roleGroupSeed()
}

seed()
