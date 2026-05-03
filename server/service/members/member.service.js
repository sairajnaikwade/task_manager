import db from "../../config/db.js";
import { success, error } from "../../utils/response.js";
import { ERR, makeErr } from "../../utils/errors.js";

export const addMember = async (req, res) => {
  const { project_id, user_id, role = "member" } = req.body.data;

  // Verify user exists
  const user = await db.user.findUnique({ where: { id: user_id } });
  if (!user) return error(res, [makeErr(ERR.NOT_FOUND, "user_id")]);

  const membership = await db.projectMember.upsert({
    where:  { project_id_user_id: { project_id, user_id } },
    update: { role },
    create: { project_id, user_id, role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return success(res, { membership });
};

export const removeMember = async (req, res) => {
  const { project_id, user_id } = req.body.data;

  await db.projectMember.delete({
    where: { project_id_user_id: { project_id, user_id } },
  });

  return success(res, { removed: true });
};

export const listMembers = async (req, res) => {
  const { project_id, page = 1, per_page = 50 } = req.body.data ?? {};
  const skip = (page - 1) * per_page;

  const [items, total] = await Promise.all([
    db.projectMember.findMany({
      where:   { project_id },
      skip,
      take:    per_page,
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    }),
    db.projectMember.count({ where: { project_id } }),
  ]);

  return success(res, { items, pagination: { page, per_page, total, total_pages: Math.ceil(total / per_page) } });
};
