import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import Sidebar from "./Sidebar";

const PageWrapper = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex min-h-screen flex-1 flex-col transition-all duration-300 lg:ml-64">
        <header className="tm-glass sticky top-0 z-30 flex h-[4.25rem] shrink-0 items-center justify-between px-4 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-black/[0.05] lg:hidden"
              style={{ color: "var(--color-text)" }}
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[var(--color-text)] lg:text-xl">
                {title || ""}
              </h1>
              <p className="mt-0.5 hidden text-xs font-medium text-[var(--color-muted)] sm:block">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div 
              className="hidden text-right sm:block cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <p className="text-sm font-semibold text-[var(--color-text)]">{user?.name}</p>
              <p className="text-[11px] font-medium capitalize text-[var(--color-muted)]">{user?.role}</p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-sm font-bold text-white shadow-md transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  boxShadow: "0 4px 16px -4px rgba(99, 102, 241, 0.55)",
                }}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border p-2 shadow-2xl"
                    style={{
                      background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
                      borderColor: "var(--color-border-strong)",
                      boxShadow: "var(--shadow-float)",
                    }}
                  >
                    <div
                      className="rounded-xl p-4"
                      style={{ background: "var(--color-bg-subtle)" }}
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold text-white"
                          style={{
                            background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                          }}
                        >
                          {user?.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                            {user?.name}
                          </p>
                          <p className="truncate text-xs text-[var(--color-muted)]">{user?.email}</p>
                        </div>
                      </div>
                      <span
                        className="inline-block rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background:
                            user?.role === "admin"
                              ? "rgba(99, 102, 241, 0.2)"
                              : "rgba(255,255,255,0.06)",
                          color: user?.role === "admin" ? "#a5b4fc" : "var(--color-muted)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        {user?.role}
                      </span>
                    </div>

                    <div className="my-2 h-px bg-[var(--color-border)]" />

                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut size={16} strokeWidth={2} />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-10 lg:py-8">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default PageWrapper;
