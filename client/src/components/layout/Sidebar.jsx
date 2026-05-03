import { NavLink } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Shield } from "lucide-react";

const navLinks = [
  { to: "/", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/projects", label: "Projects", Icon: FolderKanban },
];

const Sidebar = () => {
  const user = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? "text-white shadow-lg"
        : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-black/[0.03]"
    }`;

  const linkStyle = ({ isActive }) => ({
    background: isActive
      ? "linear-gradient(135deg, rgba(99,102,241,0.95) 0%, rgba(79,70,229,0.9) 100%)"
      : "transparent",
    boxShadow: isActive ? "0 8px 24px -6px rgba(99, 102, 241, 0.55)" : "none",
  });

  return (
    <aside
      className="fixed top-0 left-0 z-40 flex h-full w-64 flex-col border-r border-[var(--color-border)]"
      style={{
        background: "var(--color-bg-subtle)",
      }}
    >
      <div className="border-b border-[var(--color-border)] px-5 py-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg"
            style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #6366f1 45%, #4f46e5 100%)",
              boxShadow: "0 8px 24px -6px rgba(99, 102, 241, 0.6)",
            }}
          >
            ✦
          </div>
          <div>
            <span className="block text-[15px] font-bold tracking-tight text-[var(--color-text)]">
              TaskManager
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-muted)]">
              Team workspace
            </span>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
        {navLinks.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === "/"} className={linkClass} style={linkStyle}>
            <Icon size={18} strokeWidth={2} className="shrink-0 opacity-90" />
            {label}
          </NavLink>
        ))}
        {user?.role === "admin" && (
          <NavLink to="/admin" className={linkClass} style={linkStyle}>
            <Shield size={18} strokeWidth={2} className="shrink-0 opacity-90" />
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="mt-auto border-t border-[var(--color-border)] px-5 py-4">
        <p className="text-[11px] leading-relaxed text-[var(--color-muted)]">
          Signed in as{" "}
          <span className="font-semibold text-[var(--color-text)]">{user?.name ?? "—"}</span>
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
