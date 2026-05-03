import db from "../../config/db.js";
import { success, error } from "../../utils/response.js";
import { ERR, makeErr } from "../../utils/errors.js";

const SORT_ALLOWLIST = ["name", "created_at", "updated_at"];

export const listProjects = async (req, res) => {
  const { filter = {}, search, sort, page = 1, per_page = 20 } = req.body.data ?? {};
  const userId = req.user.id;
  const skip = (page - 1) * per_page;

  const where = {
    is_active: true,
    ...(req.user.role === "member" && {
      OR: [
        { members: { some: { user_id: userId } } },
        { tasks: { some: { assigned_to: userId, is_active: true } } }
      ]
    }),
    ...(search && {
      OR: [
        { name:        { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const orderBy =
    sort?.field && SORT_ALLOWLIST.includes(sort.field)
      ? { [sort.field]: sort.order === "desc" ? "desc" : "asc" }
      : { created_at: "desc" };

  const [items, total] = await Promise.all([
    db.project.findMany({
      where,
      orderBy,
      skip,
      take: per_page,
      include: { owner: { select: { id: true, name: true, email: true } }, _count: { select: { tasks: true, members: true } } },
    }),
    db.project.count({ where }),
  ]);

  return success(res, { items, pagination: { page, per_page, total, total_pages: Math.ceil(total / per_page) } });
};

export const createProject = async (req, res) => {
  if (req.user.role !== "admin") {
    return error(res, [makeErr(ERR.UNAUTHORIZED, "role", "Only admins can create projects")]);
  }
  const { name, description } = req.body.data;
  const userId = req.user.id;

  const project = await db.project.create({
    data: {
      name,
      description,
      owner_id: userId,
      members: { create: { user_id: userId, role: "admin" } },
    },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });

  return success(res, { project });
};

export const getProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Build the access-restricted query
  const project = await db.project.findFirst({
    where: {
      id,
      is_active: true,
      ...(req.user.role !== "admin" && {
        OR: [
          { members: { some: { user_id: userId } } },
          { tasks: { some: { assigned_to: userId, is_active: true } } }
        ]
      })
    },
    include: {
      owner:   { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      tasks:   { 
        where: { is_active: true },
        orderBy: { created_at: "desc" } 
      },
    },
  });

  if (!project) {
    // Distinguish between Not Found and Forbidden if possible, or just return 404 for security
    return error(res, [makeErr(ERR.NOT_FOUND, "project", "Project not found or access denied")]);
  }

  return success(res, { project });
};

export const updateProject = async (req, res) => {
  const { project_id, name, description } = req.body.data;

  const project = await db.project.update({
    where: { id: project_id },
    data: { name, description, updated_by: req.user.id },
  });

  return success(res, { project });
};

export const deleteProject = async (req, res) => {
  const { project_id } = req.body.data;

  await db.project.update({ 
    where: { id: project_id },
    data: { 
      is_active: false,
      deleted_at: new Date(),
      deleted_by: req.user.id
    }
  });
  return success(res, { deleted: true });
};
