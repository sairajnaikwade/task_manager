import db from "../../config/db.js";
import bcrypt from "bcryptjs";
import { success, error } from "../../utils/response.js";
import { ERR, makeErr } from "../../utils/errors.js";

export const listUsers = async (req, res) => {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  });
  return success(res, { items: users });
};

export const updateUserRole = async (req, res) => {
  const { user_id, role } = req.body.data;
  
  if (user_id === req.user.id) {
    return error(res, [makeErr(ERR.UNAUTHORIZED, "role", "Cannot change your own role")]);
  }

  const updatedUser = await db.user.update({
    where: { id: user_id },
    data: { role },
    select: { id: true, name: true, email: true, role: true }
  });

  return success(res, { user: updatedUser });
};

export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return error(res, [makeErr(ERR.EMAIL_TAKEN, "email")]);
  }

  const password_hash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { name, email, password_hash, role },
    select: { id: true, name: true, email: true, role: true, created_at: true }
  });

  return success(res, { user });
};
export const deleteUser = async (req, res) => {
  const { user_id } = req.body.data;

  if (user_id === req.user.id) {
    return error(res, [makeErr(ERR.UNAUTHORIZED, "user_id", "Cannot delete your own account")]);
  }

  await db.user.delete({ where: { id: user_id } });
  return success(res, { deleted: true });
};
