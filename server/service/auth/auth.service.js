import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../../config/db.js";
import { env } from "../../config/env.js";
import { success, error } from "../../utils/response.js";
import { ERR, makeErr } from "../../utils/errors.js";

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

export const register = async (req, res) => {
  const { name, email, password } = req.body.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return error(res, [makeErr(ERR.EMAIL_TAKEN, "email")]);
  }

  const password_hash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { name, email, password_hash, role: "member" },
  });

  const token = signToken(user);
  return success(res, {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return error(res, [makeErr(ERR.NOT_FOUND, "email")]);
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return error(res, [makeErr(ERR.WRONG_PASSWORD, "password")]);
  }

  const token = signToken(user);
  return success(res, {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};
