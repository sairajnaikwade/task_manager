import db from "../config/db.js";
import { error } from "../utils/response.js";
import { ERR, makeErr } from "../utils/errors.js";

const ROLE_RANK = { member: 1, admin: 2 };

/**
 * Project-level RBAC middleware factory.
 * Usage: rbacMiddleware("admin") or rbacMiddleware("member")
 *
 * Expects either:
 *   - req.params.id (for GET /api/v1/projects/:id style routes)
 *   - req.body.data.project_id
 */
export const rbacMiddleware = (requiredRole = "member") => {
  return async (req, res, next) => {
    const projectId = req.params.id ?? req.body?.data?.project_id;

    if (!projectId) {
      return error(res, [makeErr(ERR.MISSING, "project_id")]);
    }

    try {
      // Global admin bypass
      if (req.user && req.user.role === "admin") {
        req.projectRole = "admin";
        return next();
      }

      let membership = await db.projectMember.findUnique({
        where: {
          project_id_user_id: {
            project_id: projectId,
            user_id: req.user.id,
          },
        },
      });

      // If not a member, check if they are an assignee of any active task in this project
      if (!membership) {
        const hasTask = await db.task.findFirst({
          where: { project_id: projectId, assigned_to: req.user.id, is_active: true },
          select: { id: true }
        });

        if (hasTask) {
          // Grant "member" level access to assignees
          membership = { role: "member" };
        }
      }

      if (!membership) {
        return error(res, [makeErr(ERR.FORBIDDEN, "project_id", "No access to this project")]);
      }

      const userRank = ROLE_RANK[membership.role] ?? 0;
      const requiredRank = ROLE_RANK[requiredRole] ?? 0;

      if (userRank < requiredRank) {
        return error(res, [makeErr(ERR.FORBIDDEN, "role")]);
      }

      req.projectRole = membership.role;
      next();
    } catch (err) {
      return error(res, [makeErr(ERR.INTERNAL, "")], 500);
    }
  };
};
