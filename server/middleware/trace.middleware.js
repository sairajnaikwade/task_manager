import { v4 as uuidv4 } from "uuid";
import logger from "../config/logger.js";

/**
 * Reads or generates X-TaskManager-Trace-ID.
 * Attaches to req.traceId and echoes back in response header.
 * Logs each request with trace ID via pino.
 */
export const traceMiddleware = (req, res, next) => {
  const traceId = req.headers["x-taskmanager-trace-id"] ?? uuidv4();
  req.traceId = traceId;
  res.setHeader("X-TaskManager-Trace-ID", traceId);

  logger.info({
    traceId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  }, "incoming request");

  next();
};
