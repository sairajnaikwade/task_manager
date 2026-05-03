import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const tasks = await prisma.task.findMany({
    where: { title: { contains: 'Write API documentation', mode: 'insensitive' } },
    include: { creator: true, assignee: true }
  })
  console.log(JSON.stringify(tasks, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
