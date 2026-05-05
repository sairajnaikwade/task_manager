import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { login, loading, authError } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loginMode, setLoginMode] = useState("member"); // 'member' or 'admin'

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full blur-[100px]"
        style={{ background: "rgba(99, 102, 241, 0.25)" }}
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-1/4 h-64 w-64 rounded-full blur-[90px]"
        style={{ background: "rgba(52, 211, 153, 0.12)" }}
      />

      <div className="relative w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg"
            style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #4f46e5 100%)",
              boxShadow: "0 12px 40px -12px rgba(99, 102, 241, 0.65)",
            }}
          >
            ✦
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            {loginMode === "admin" ? "Admin Login" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm font-medium text-[var(--color-muted)]">
            {loginMode === "admin" 
              ? "Access the control panel and management tools" 
              : "Sign in to continue to your workspace"}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex p-1 bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)] mb-6">
          <button
            onClick={() => setLoginMode("member")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              loginMode === "member" 
                ? "bg-[var(--color-surface)] text-[var(--color-accent)] shadow-sm border border-[var(--color-border-strong)]" 
                : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            Member
          </button>
          <button
            onClick={() => setLoginMode("admin")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              loginMode === "admin" 
                ? "bg-[var(--color-surface)] text-[var(--color-danger)] shadow-sm border border-[var(--color-border-strong)]" 
                : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            Admin
          </button>
        </div>

        <div
          className="rounded-2xl border p-6 sm:p-8"
          style={{
            background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
            borderColor: "var(--color-border-strong)",
            boxShadow: "var(--shadow-float)",
          }}
        >
          {authError && (
            <div
              className="mb-5 rounded-xl border px-4 py-3 text-sm font-medium"
              style={{
                background: "rgba(248, 113, 113, 0.1)",
                borderColor: "rgba(248, 113, 113, 0.35)",
                color: "#fca5a5",
              }}
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="tm-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="login-user-secret"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="tm-input"
                placeholder="••••••••"
              />
            </div>

            <button id="login-submit" type="submit" disabled={loading} className="tm-btn-primary mt-1 w-full py-3">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          
          <div
            className="mt-6 rounded-xl border px-4 py-3 text-xs leading-relaxed"
            style={{
              background: "var(--color-bg-subtle)",
              borderColor: "var(--color-border)",
              color: "var(--color-muted)",
            }}
          >
            <p className="mb-2 font-semibold text-[var(--color-text)]">
              {loginMode === "admin" ? "Demo Admin Account" : "Demo Member Account"}
            </p>
            {loginMode === "admin" ? (
              <p>
                <span className="text-[var(--color-text)]">admin@demo.com</span> · Admin1234!
              </p>
            ) : (
              <p>
                <span className="text-[var(--color-text)]">alice@demo.com</span> · Member1234!
              </p>
            )}
          </div>
        </div>

        {loginMode === "member" && (
          <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
            No account?{" "}
            <Link to="/register" className="font-semibold text-[var(--color-accent)] hover:underline">
              Create one
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
