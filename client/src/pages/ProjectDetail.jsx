import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import StatusBadge from "../components/tasks/StatusBadge";
import RoleGuard from "../routes/RoleGuard";
import { Edit2, Trash2, UserPlus } from "lucide-react";
import { useProject, useUpdateProject, useDeleteProject } from "../hooks/useProjects";
import { useCreateTask, useUpdateTask } from "../hooks/useTasks";
import { useUserDirectory } from "../hooks/useUserDirectory";
import { useAddMember, useRemoveMember } from "../hooks/useMembers";
import { getFirstError } from "../utils/errorHandler";

const COLUMNS = [
  { status: "todo",        label: "To Do"       },
  { status: "in_progress", label: "In Progress" },
  { status: "done",        label: "Done"         },
];

const emptyTaskForm = { title: "", description: "", status: "todo", priority: "normal", due_date: "", assigned_to: "" };

const ProjectDetail = () => {
  const { id } = useParams();
  const { data: project, isLoading } = useProject(id);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: allUsers } = useUserDirectory();

  const navigate = useNavigate();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [showEditForm, setShowEditForm]   = useState(false);
  const [editFormData, setEditFormData]   = useState({ name: "", description: "" });
  const [editFormError, setEditFormError] = useState(null);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm]         = useState(emptyTaskForm);
  const [taskError, setTaskError]       = useState(null);

  const user = (() => { try { return JSON.parse(sessionStorage.getItem("user")); } catch { return null; } })();
  const myMembership = project?.members?.find((m) => m.user_id === user?.id);
  const myRole = myMembership?.role ?? "member";
  const isAdmin = user?.role === "admin";
  const canEditProject = isAdmin || project?.owner?.id === user?.id;

  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberForm, setMemberForm]         = useState({ user_id: "", role: "member" });
  const [memberError, setMemberError]       = useState(null);

  const addMember = useAddMember();
  const removeMember = useRemoveMember();

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError(null);
    if (!memberForm.user_id) {
      setMemberError("Please select a user");
      return;
    }
    const res = await addMember.mutateAsync({ project_id: id, ...memberForm });
    if (res.status !== "success") {
      setMemberError(getFirstError(res.messages));
      return;
    }
    setShowMemberForm(false);
    setMemberForm({ user_id: "", role: "member" });
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      await removeMember.mutateAsync({ project_id: id, user_id: userId });
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskError(null);
    const payload = {
      ...taskForm,
      project_id:  id,
      due_date:    taskForm.due_date ? new Date(taskForm.due_date).toISOString() : null,
      assigned_to: taskForm.assigned_to || null,
    };
    const res = await createTask.mutateAsync(payload);
    if (res.status !== "success") { setTaskError(getFirstError(res.messages)); return; }
    setShowTaskForm(false);
    setTaskForm(emptyTaskForm);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFormError(null);
    const res = await updateProject.mutateAsync({ project_id: id, name: editFormData.name, description: editFormData.description });
    if (res.status !== "success") {
      setEditFormError(getFirstError(res.messages));
      return;
    }
    setShowEditForm(false);
  };

  const handleDeleteProject = async () => {
    if (window.confirm(`Are you sure you want to delete project "${project.name}"?`)) {
      try {
        await deleteProject.mutateAsync({ project_id: id });
        alert("Project deleted successfully.");
        navigate("/projects");
      } catch (err) {
        alert("Failed to delete project.");
      }
    }
  };

  const moveTask = async (taskId, newStatus) => {
    await updateTask.mutateAsync({ task_id: taskId, status: newStatus });
  };

  if (isLoading) return <PageWrapper><p style={{ color: "var(--color-muted)" }}>Loading…</p></PageWrapper>;
  if (!project)  return <PageWrapper><p style={{ color: "var(--color-danger)" }}>Project not found.</p></PageWrapper>;

  const tasksByStatus = (status) =>
    (project.tasks ?? []).filter((t) => t.status === status);

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] lg:text-3xl">{project.name}</h1>
            {canEditProject && (
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => { setEditFormData({ name: project.name, description: project.description || "" }); setShowEditForm(true); }}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                  style={{ color: "var(--color-muted)" }}
                  title="Edit Project"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="p-1 rounded hover:bg-red-500/10 transition-colors text-red-500"
                  title="Delete Project"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
          {project.description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">{project.description}</p>
          )}
        </div>
        <RoleGuard role="member" userRole={myRole}>
          <button id="btn-add-task" type="button" onClick={() => setShowTaskForm(true)} className="tm-btn-primary">
            + Add task
          </button>
        </RoleGuard>
      </div>

      {/* Edit form modal */}
      {showEditForm && (
        <div className="tm-modal-overlay z-[100]">
          <div
            className="w-full max-w-md rounded-2xl border p-8"
            style={{
              background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
              borderColor: "var(--color-border-strong)",
              boxShadow: "var(--shadow-float)",
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text)" }}>Edit Project</h2>
            {editFormError && <p className="text-sm mb-3" style={{ color: "var(--color-danger)" }}>{editFormError}</p>}
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <input
                id="edit-project-name"
                type="text"
                required
                placeholder="Project name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="tm-input"
              />
              <textarea
                id="edit-project-desc"
                placeholder="Description (optional)"
                rows={3}
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="tm-input resize-none"
              />
              <div className="flex gap-3">
                <button type="submit" disabled={updateProject.isPending} className="tm-btn-primary flex-1 py-2.5">
                  {updateProject.isPending ? "Saving…" : "Save Changes"}
                </button>
                <button type="button" onClick={() => setShowEditForm(false)} className="tm-btn-secondary flex-1 py-2.5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create task modal */}
      {showTaskForm && (
        <div className="tm-modal-overlay">
          <div
            className="w-full max-w-md rounded-2xl border p-8"
            style={{
              background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
              borderColor: "var(--color-border-strong)",
              boxShadow: "var(--shadow-float)",
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text)" }}>New Task</h2>
            {taskError && <p className="text-sm mb-3" style={{ color: "var(--color-danger)" }}>{taskError}</p>}
            <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
              <input
                required
                placeholder="Task title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="tm-input"
              />
              <textarea
                placeholder="Description (optional)"
                rows={2}
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="tm-input resize-none"
              />
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="tm-input"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="tm-input"
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: "var(--color-muted)" }}>Due Date</label>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  className="tm-input"
                />
              </div>
              <select
                value={taskForm.assigned_to}
                onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                className="tm-input"
              >
                <option value="">Unassigned</option>
                {allUsers?.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
              <div className="mt-1 flex gap-3">
                <button type="submit" disabled={createTask.isPending} className="tm-btn-primary flex-1 py-2.5">
                  {createTask.isPending ? "Creating…" : "Create task"}
                </button>
                <button type="button" onClick={() => setShowTaskForm(false)} className="tm-btn-secondary flex-1 py-2.5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add member modal */}
      {showMemberForm && (
        <div className="tm-modal-overlay z-[100]">
          <div
            className="w-full max-w-md rounded-2xl border p-8"
            style={{
              background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
              borderColor: "var(--color-border-strong)",
              boxShadow: "var(--shadow-float)",
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text)" }}>Add Team Member</h2>
            {memberError && <p className="text-sm mb-3" style={{ color: "var(--color-danger)" }}>{memberError}</p>}
            <form onSubmit={handleAddMember} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: "var(--color-muted)" }}>Select User</label>
                <select
                  required
                  value={memberForm.user_id}
                  onChange={(e) => setMemberForm({ ...memberForm, user_id: e.target.value })}
                  className="tm-input"
                >
                  <option value="">Choose a user...</option>
                  {allUsers?.filter(u => !project.members?.some(m => m.user_id === u.id)).map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: "var(--color-muted)" }}>Role</label>
                <select
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  className="tm-input"
                >
                  <option value="member">Member (Can manage tasks)</option>
                  <option value="admin">Admin (Can manage project & members)</option>
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="submit" disabled={addMember.isPending} className="tm-btn-primary flex-1 py-2.5">
                  {addMember.isPending ? "Adding…" : "Add Member"}
                </button>
                <button type="button" onClick={() => setShowMemberForm(false)} className="tm-btn-secondary flex-1 py-2.5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban board */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map(({ status }) => (
          <div
            key={status}
            className="rounded-2xl border p-4"
            style={{
              background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
              borderColor: "var(--color-border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <StatusBadge status={status} />
              <span className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
                {tasksByStatus(status).length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {tasksByStatus(status).map((task) => {
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";
                return (
                  <div
                    key={task.id}
                    className="rounded-xl border p-3 transition-shadow hover:shadow-md"
                    style={{
                      background: "var(--color-bg-subtle)",
                      borderColor: isOverdue ? "rgba(248,113,113,0.45)" : "var(--color-border)",
                    }}
                  >
                    <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>{task.title}</p>
                    {task.description && (
                      <p className="text-xs mb-2 line-clamp-2" style={{ color: "var(--color-muted)" }}>{task.description}</p>
                    )}
                    {isOverdue && (
                      <p className="text-xs mb-2" style={{ color: "#f87171" }}>⚠ Overdue</p>
                    )}
                    <RoleGuard role="member" userRole={myRole}>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {COLUMNS.filter((c) => c.status !== status).map((c) => (
                          <button key={c.status}
                            onClick={() => moveTask(task.id, c.status)}
                            className="text-xs px-2 py-1 rounded border hover:opacity-80"
                            style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
                            → {c.label}
                          </button>
                        ))}
                      </div>
                    </RoleGuard>
                  </div>
                );
              })}
              {tasksByStatus(status).length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: "var(--color-muted)" }}>No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Members section */}
      <div
        className="rounded-2xl border p-6"
        style={{
          background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
          borderColor: "var(--color-border-strong)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-tight text-[var(--color-text)]">
            Team Members ({project.members?.length ?? 0})
          </h2>
          {(isAdmin || myRole === "admin") && (
            <button
              id="btn-add-member"
              onClick={() => setShowMemberForm(true)}
              className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all hover:translate-y-[-1px] hover:shadow-lg group"
              style={{
                background: "var(--color-bg-subtle)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border-strong)",
                boxShadow: "0 2px 8px -2px rgba(0,0,0,0.05)"
              }}
            >
              <UserPlus size={14} className="group-hover:scale-110 group-hover:text-indigo-500 transition-all" />
              <span>Add Member</span>
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {project.members?.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0"
              style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)" }}
                >
                  {m.user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{m.user?.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>{m.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                  style={{ background: m.role === "admin" ? "#312e81" : "#1e293b", color: m.role === "admin" ? "#a5b4fc" : "#94a3b8" }}>
                  {m.role}
                </span>
                {(isAdmin || myRole === "admin") && m.user_id !== user?.id && m.user_id !== project.owner_id && (
                  <button
                    onClick={() => handleRemoveMember(m.user_id)}
                    className="p-1 rounded hover:bg-red-500/10 transition-colors text-red-500"
                    title="Remove Member"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default ProjectDetail;
