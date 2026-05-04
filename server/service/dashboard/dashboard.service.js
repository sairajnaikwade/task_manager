import db from "../../config/db.js";
import { success } from "../../utils/response.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // RBAC: Admins see all projects; members see only theirs
    let projectIds = [];
    if (req.user.role === "admin") {
      const allProjects = await db.project.findMany({
        where: { is_active: true },
        select: { id: true }
      });
      projectIds = allProjects.map(p => p.id);
    } else {
      // Member: See projects where they are a member OR have an assigned task
      const projectsWithAccess = await db.project.findMany({
        where: {
          is_active: true,
          OR: [
            { members: { some: { user_id: userId } } },
            { tasks: { some: { assigned_to: userId, is_active: true } } }
          ]
        },
        select: { id: true }
      });
      projectIds = projectsWithAccess.map((p) => p.id);
    }

    const userRole = req.user.role;
    const isMember = userRole === "member";

    // Task filter base
    const taskWhere = {
      is_active: true,
      project_id: { in: projectIds },
    };

    // If member, restrict to their own tasks
    if (isMember) {
      taskWhere.OR = [
        { assigned_to: userId },
        { created_by: userId }
      ];
    }

    const deletedWhere = {
      is_active: false,
      project_id: { in: projectIds },
    };
    if (isMember) {
      deletedWhere.OR = [
        { assigned_to: userId },
        { created_by: userId },
      ];
    }

    const now = new Date();

    const [total, byStatus, overdue, recentTasks, deletedCount] = await Promise.all([
      // Total tasks
      db.task.count({ where: taskWhere }),

      // Group by status
      db.task.groupBy({
        by: ["status"],
        where: taskWhere,
        _count: { _all: true },
      }),

      // Overdue
      db.task.count({
        where: {
          ...taskWhere,
          due_date: { lt: now },
          status: { not: "done" },
        },
      }),

      // 5 most recently updated tasks
      db.task.findMany({
        where: taskWhere,
        orderBy: { updated_at: "desc" },
        take: 5,
        include: {
          assignee: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
        },
      }),

      db.task.count({ where: deletedWhere }),
    ]);

    // Transform groupBy result into { todo, in_progress, done }
    const by_status = { todo: 0, in_progress: 0, done: 0 };
    for (const row of byStatus) {
      by_status[row.status] = row._count._all;
    }

    return success(res, {
      total_tasks: total,
      by_status,
      overdue,
      deleted: deletedCount,
      recent_tasks: recentTasks,
      project_count: projectIds.length,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    return error(res, [{ errcode: "internal_error", msgid: 1, field: "database", vals: [err.message] }]);
  }
};
