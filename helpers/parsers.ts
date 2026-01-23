import { Prisma } from '@prisma/client'

function parsePrisma(json: Prisma.JsonValue) {
  return json ? JSON.parse(json as string) : null
}

export { parsePrisma }
