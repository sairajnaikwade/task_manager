import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Database Health Check ---');

  try {
    const userCount = await prisma.user.count();
    console.log(`Users: ${userCount}`);

    const projectStats = await prisma.project.groupBy({
      by: ['is_active'],
      _count: true,
    });
    console.log('Projects:', projectStats);

    const taskStats = await prisma.task.groupBy({
      by: ['is_active'],
      _count: true,
    });
    console.log('Tasks:', taskStats);

    const activeTasks = await prisma.task.findMany({
      where: { is_active: true },
      take: 5,
      select: {
        title: true,
        status: true,
        created_at: true,
        creator: { select: { name: true } }
      }
    });
    console.log('\nSample Active Tasks:', JSON.stringify(activeTasks, null, 2));

    const deletedTasks = await prisma.task.findMany({
      where: { is_active: false },
      take: 5,
      select: {
        title: true,
        deleted_at: true,
        deleted_by: true
      }
    });
    console.log('\nSample Deleted Tasks (Audit check):', JSON.stringify(deletedTasks, null, 2));

  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
