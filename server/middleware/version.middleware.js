/**
 * Reads the `ver` header (defaults to 1) and attaches req.ver.
 * Route handlers use req.ver to branch between v1/v2 code paths.
 */
export const versionMiddleware = (req, res, next) => {
  const ver = parseInt(req.headers["ver"] ?? "1", 10);
  req.ver = isNaN(ver) ? 1 : ver;
  next();
};
