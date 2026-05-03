import { useState } from "react";
import PageWrapper from "../components/layout/PageWrapper";
import { useUsers, useUpdateUserRole, useCreateUser, useDeleteUser } from "../hooks/useAdmin";
import { Trash2 } from "lucide-react";

const AdminPanel = () => {
  const { data: usersData, isLoading, isError } = useUsers();
  const updateRole = useUpdateUserRole();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "member" });
  const [formError, setFormError] = useState("");

  const users = usersData?.items ?? [];
  const currentUser = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();

  const handleRoleToggle = async (user) => {
    const newRole = user.role === "admin" ? "member" : "admin";
    if (window.confirm(`Change ${user.name}'s role to ${newRole}?`)) {
      await updateRole.mutateAsync({ user_id: user.id, role: newRole });
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      try {
        await deleteUser.mutateAsync({ user_id: user.id });
      } catch {
        alert("Failed to delete user.");
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await createUser.mutateAsync(formData);
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "member" });
    } catch (err) {
      setFormError(err.response?.data?.messages?.[0]?.message || "Failed to create user.");
    }
  };

  return (
    <PageWrapper title="Admin Panel">
      <div
        className="rounded-2xl border p-6"
        style={{
          background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
          borderColor: "var(--color-border-strong)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[var(--color-text)]">User management</h2>
          <button type="button" onClick={() => setIsModalOpen(true)} className="tm-btn-primary w-full sm:w-auto">
            + Add user
          </button>
        </div>
        
        {isLoading ? (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>Loading users...</p>
        ) : isError ? (
          <p className="text-sm" style={{ color: "var(--color-danger)" }}>Failed to load users.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-xl border p-4"
                style={{ borderColor: "var(--color-border)", background: "var(--color-bg-subtle)" }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{u.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>{u.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                    style={{ background: u.role === "admin" ? "#312e81" : "#1e293b", color: u.role === "admin" ? "#a5b4fc" : "#94a3b8" }}>
                    {u.role}
                  </span>
                  {u.id !== currentUser?.id && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleRoleToggle(u)} disabled={updateRole.isPending}
                        className="text-xs px-3 py-1.5 rounded border hover:opacity-80 transition-all disabled:opacity-50"
                        style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}>
                        Make {u.role === "admin" ? "Member" : "Admin"}
                      </button>
                      <button onClick={() => handleDeleteUser(u)} disabled={deleteUser.isPending}
                        className="p-1.5 rounded border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        title="Delete User">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="tm-modal-overlay">
          <div
            className="w-full max-w-md rounded-2xl border p-6"
            style={{
              background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
              borderColor: "var(--color-border-strong)",
              boxShadow: "var(--shadow-float)",
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text)" }}>Add New User</h3>
            {formError && <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-500 text-sm">{formError}</div>}
            <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-muted)" }}>Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="tm-input" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-muted)" }}>Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="tm-input" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-muted)" }}>Temporary Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="tm-input" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-muted)" }}>Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="tm-input">
                  <option value="member">Member</option>
                  <option value="admin">Global Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm rounded-lg transition-colors" style={{ color: "var(--color-muted)" }}>Cancel</button>
                <button type="submit" disabled={createUser.isPending} className="tm-btn-primary px-4 py-2.5 disabled:opacity-50">{createUser.isPending ? "Saving..." : "Create user"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default AdminPanel;
