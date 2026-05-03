/**
 * Conditionally renders children based on the user's project-level role.
 * Usage: <RoleGuard role="admin" userRole={currentMembership.role}>...</RoleGuard>
 */
const ROLE_RANK = { member: 1, admin: 2 };

const RoleGuard = ({ role, userRole, children, fallback = null }) => {
  const required = ROLE_RANK[role]    ?? 0;
  const actual   = ROLE_RANK[userRole] ?? 0;
  return actual >= required ? children : fallback;
};

export default RoleGuard;
