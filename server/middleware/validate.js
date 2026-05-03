import { error } from "../utils/response.js";
import { makeErr, ERR } from "../utils/errors.js";

/**
 * Zod validation middleware factory.
 * Usage: validate(myZodSchema) as route middleware.
 * Validates req.body.data and attaches parsed result back to req.body.data.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body?.data ?? {});
  if (!result.success) {
    const messages = result.error.errors.map((e) =>
      makeErr(ERR.INVALID, e.path.join("."), [e.message])
    );
    return error(res, messages);
  }
  req.body.data = result.data;
  next();
};
