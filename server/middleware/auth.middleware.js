import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { error } from "../utils/response.js";
import { ERR, makeErr } from "../utils/errors.js";

/**
 * Validates Authorization: Bearer <token>.
 * Attaches decoded payload to req.user on success.
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"] ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return error(res, [makeErr(ERR.UNAUTHORIZED, "authorization")]);
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return error(res, [makeErr(ERR.AUTH_EXP, "authorization")]);
    }
    return error(res, [makeErr(ERR.UNAUTHORIZED, "authorization")]);
  }
};
