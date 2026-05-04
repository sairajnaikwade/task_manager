import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const { register, loading, authError } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    register(form);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="pointer-events-none absolute -left-24 top-1/3 h-64 w-64 rounded-full blur-[100px]"
        style={{ background: "rgba(139, 92, 246, 0.2)" }}
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-1/3 h-72 w-72 rounded-full blur-[100px]"
        style={{ background: "rgba(99, 102, 241, 0.15)" }}
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
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Create an account</h1>
          <p className="mt-2 text-sm font-medium text-[var(--color-muted)]">Start managing projects with your team</p>
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
                htmlFor="register-name"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]"
              >
                Full name
              </label>
              <input
                id="register-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="tm-input"
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]"
              >
                Email
              </label>
              <input
                id="register-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="tm-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]"
              >
                Password <span className="font-normal normal-case text-[var(--color-muted)]">(min. 8)</span>
              </label>
              <input
                id="register-password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="tm-input"
                placeholder="••••••••"
              />
            </div>

            <button id="register-submit" type="submit" disabled={loading} className="tm-btn-primary mt-1 w-full py-3">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[var(--color-accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
