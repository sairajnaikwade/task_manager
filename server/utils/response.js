/**
 * Standard response helpers.
 * Callers never look at HTTP status to judge success —
 * HTTP codes are transport-level only. Application success/failure
 * is always indicated by the `status` field.
 */

export const success = (res, data = {}, messages = []) =>
  res.status(200).json({ status: "success", data, messages });

export const error = (res, messages = [], httpCode = 200) =>
  res.status(httpCode).json({ status: "error", data: {}, messages });
