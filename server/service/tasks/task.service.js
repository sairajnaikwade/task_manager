import db from "../../config/db.js";
import { success, error } from "../../utils/response.js";
import { ERR, makeErr } from "../../utils/errors.js";

const VALID_STATUSES = ["todo", "in_progress", "done"];
const SORT_ALLOWLIST  = ["title", "due_date", "created_at", "updated_at", "status"];

export const listTasks = async (req, res) => {
  const { filter = {}, search, sort, page = 1, per_page = 20 } = req.body.data ?? {};
  const skip = (page - 1) * per_page;

  // Build Prisma where clause
  const andClauses = [];
  const showDeleted = filter.is_deleted === true;

  // RBAC: Admins see all tasks globally; members see only their assigned/created tasks in their projects
  if (req.user.role === "member") {
    const userProjects = await db.projectMember.findMany({
      where: { user_id: req.user.id },
      select: { project_id: true },
    });
    const projectIds = userProjects.map((m) => m.project_id);

    andClauses.push({
      is_active: !showDeleted,
      OR: [
        { project_id: { in: projectIds } },
        { assigned_to: req.user.id },
        { created_by: req.user.id },
      ],
    });
  } else {
    andClauses.push({ is_active: !showDeleted });
  }

  if (filter.project_id) andClauses.push({ project_id: filter.project_id });
  if (filter.assigned_to) andClauses.push({ assigned_to: filter.assigned_to });
  if (filter.created_by)  andClauses.push({ created_by:  filter.created_by  });
  if (filter.due_before)  andClauses.push({ due_date: { lte: new Date(filter.due_before) } });
  if (filter.status && filter.status.length > 0) {
    andClauses.push({ status: { in: filter.status } });
  }
  if (filter.is_overdue) {
    andClauses.push({ due_date: { lt: new Date() } });
    andClauses.push({ status: { not: "done" } });
  }

  if (search) {
    andClauses.push({
      OR: [
        { title:       { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const where = andClauses.length > 0 ? { AND: andClauses } : {};

  const orderBy =
    sort?.field && SORT_ALLOWLIST.includes(sort.field)
      ? { [sort.field]: sort.order === "desc" ? "desc" : "asc" }
      : { created_at: "desc" };

  const [items, total] = await Promise.all([
    db.task.findMany({
      where,
      orderBy,
      skip,
      take: per_page,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator:  { select: { id: true, name: true, email: true } },
        project:  { select: { id: true, name: true } },
      },
    }),
    db.task.count({ where }),
  ]);

  return success(res, { items, pagination: { page, per_page, total, total_pages: Math.ceil(total / per_page) } });
};

export const createTask = async (req, res) => {
  const { title, description, status = "todo", priority = "normal", due_date, project_id, assigned_to } = req.body.data;

  const task = await db.task.create({
    data: {
      title,
      description,
      status,
      priority,
      due_date: due_date ? new Date(due_date) : null,
      project_id,
      assigned_to: assigned_to ?? null,
      created_by: req.user.id,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator:  { select: { id: true, name: true, email: true } },
    },
  });

  return success(res, { task });
};

export const getTask = async (req, res) => {
  const { id } = req.params;

  const task = await db.task.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator:  { select: { id: true, name: true, email: true } },
      project:  { select: { id: true, name: true } },
      comments: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { created_at: "asc" }
      }
    },
  });

  if (!task) return error(res, [makeErr(ERR.NOT_FOUND, "task_id")]);
  if (!task.is_active) return error(res, [makeErr(ERR.NOT_FOUND, "task_id")]);
  return success(res, { task });
};

export const updateTask = async (req, res) => {
  const { task_id, title, description, status, priority, due_date, assigned_to } = req.body.data;

  // If status is being updated, enforce RBAC and transitions
  if (status !== undefined) {
    const currentTask = await db.task.findUnique({
      where: { id: task_id },
      select: { status: true, assigned_to: true, project_id: true }
    });

    if (!currentTask) {
      return error(res, [makeErr(ERR.NOT_FOUND, "task_id")]);
    }

    if (currentTask.status !== status) {
      // 1. RBAC check
      let isAllowed = false;
      if (req.user.role === "admin") {
        isAllowed = true; // Global admin
      } else {
        const projectMember = await db.projectMember.findUnique({
          where: { project_id_user_id: { project_id: currentTask.project_id, user_id: req.user.id } }
        });
        if (projectMember?.role === "admin") {
          isAllowed = true; // Project admin
        } else if (projectMember?.role === "member") {
          if (currentTask.assigned_to === req.user.id || currentTask.created_by === req.user.id) {
            isAllowed = true; // Assignee or Creator
          }
        }
      }

      if (!isAllowed) {
        return error(res, [makeErr(ERR.UNAUTHORIZED, "status", "You do not have permission to change the status of this task")]);
      }

      // 2. Transition check
      const validTransitions = {
        todo: ["in_progress"],
        in_progress: ["todo", "done"],
        done: ["in_progress"],
      };

      const allowedNext = validTransitions[currentTask.status] || [];
      if (!allowedNext.includes(status)) {
        return error(res, [makeErr(ERR.VALIDATION_ERROR, "status", `Invalid transition from ${currentTask.status} to ${status}`)]);
      }
    }
  }

  const task = await db.task.update({
    where: { id: task_id },
    data: {
      ...(title       !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status      !== undefined && { status }),
      ...(priority    !== undefined && { priority }),
      ...(due_date    !== undefined && { due_date: due_date ? new Date(due_date) : null }),
      ...(assigned_to !== undefined && { assigned_to }),
      updated_by: req.user.id,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator:  { select: { id: true, name: true, email: true } },
    },
  });

  return success(res, { task });
};

export const deleteTask = async (req, res) => {
  const { task_id } = req.body.data;

  const currentTask = await db.task.findUnique({
    where: { id: task_id },
    select: { assigned_to: true, created_by: true, project_id: true, is_active: true },
  });

  if (!currentTask || !currentTask.is_active) {
    return error(res, [makeErr(ERR.NOT_FOUND, "task_id")]);
  }

  let isAllowed = false;
  if (req.user.role === "admin") {
    isAllowed = true;
  } else {
    const projectMember = await db.projectMember.findUnique({
      where: {
        project_id_user_id: { project_id: currentTask.project_id, user_id: req.user.id },
      },
    });
    if (projectMember?.role === "admin") {
      isAllowed = true;
    } else if (projectMember?.role === "member") {
      if (
        currentTask.assigned_to === req.user.id ||
        currentTask.created_by === req.user.id
      ) {
        isAllowed = true;
      }
    }
  }

  if (!isAllowed) {
    return error(res, [
      makeErr(ERR.UNAUTHORIZED, "action", [
        "You do not have permission to delete this task",
      ]),
    ]);
  }

  await db.task.update({ 
    where: { id: task_id },
    data: { 
      is_active: false,
      deleted_at: new Date(),
      deleted_by: req.user.id
    }
  });
  return success(res, { deleted: true });
};

export const addComment = async (req, res) => {
  const { id: task_id } = req.params;
  const { content } = req.body.data;

  const comment = await db.taskComment.create({
    data: {
      content,
      task_id,
      user_id: req.user.id,
    },
    include: {
      author: { select: { id: true, name: true } }
    }
  });

  return success(res, { comment });
};
