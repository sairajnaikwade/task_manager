import { useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "../hooks/useProjects";
import { getFirstError } from "../utils/errorHandler";
import { Edit2, Trash2 } from "lucide-react";

const Projects = () => {
  const { data, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [showForm, setShowForm]   = useState(false);
  const [formData, setFormData]   = useState({ name: "", description: "" });
  const [formError, setFormError] = useState(null);

  const [showEditForm, setShowEditForm]   = useState(false);
  const [editFormData, setEditFormData]   = useState({ id: "", name: "", description: "" });
  const [editFormError, setEditFormError] = useState(null);

  const currentUser = (() => { try { return JSON.parse(sessionStorage.getItem("user")); } catch { return null; } })();
  const isAdmin = currentUser?.role === "admin";

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(null);
    const res = await createProject.mutateAsync(formData);
    if (res.status !== "success") {
      setFormError(getFirstError(res.messages));
      return;
    }
    setShowForm(false);
    setFormData({ name: "", description: "" });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFormError(null);
    const res = await updateProject.mutateAsync({ project_id: editFormData.id, name: editFormData.name, description: editFormData.description });
    if (res.status !== "success") {
      setEditFormError(getFirstError(res.messages));
      return;
    }
    setShowEditForm(false);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete project "${name}"?`)) {
      try {
        await deleteProject.mutateAsync({ project_id: id });
        alert("Project deleted successfully.");
      } catch (err) {
        alert("Failed to delete project.");
      }
    }
  };

  const projects = data?.items ?? [];

  return (
    <PageWrapper title="Projects">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          {projects.length} project{projects.length !== 1 ? "s" : ""}
        </p>
        {isAdmin && (
          <button id="btn-new-project" type="button" onClick={() => setShowForm(true)} className="tm-btn-primary">
            + New project
          </button>
        )}
      </div>

      {/* Create form modal */}
      {showForm && (
        <div className="tm-modal-overlay">
          <div
            className="w-full max-w-md rounded-2xl border p-8"
            style={{
              background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
              borderColor: "var(--color-border-strong)",
              boxShadow: "var(--shadow-float)",
            }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text)" }}>New Project</h2>
            {formError && <p className="text-sm mb-3" style={{ color: "var(--color-danger)" }}>{formError}</p>}
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <input
                id="new-project-name"
                type="text"
                required
                placeholder="Project name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="tm-input"
              />
              <textarea
                id="new-project-desc"
                placeholder="Description (optional)"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="tm-input resize-none"
              />
              <div className="flex gap-3">
                <button type="submit" disabled={createProject.isPending} className="tm-btn-primary flex-1 py-2.5">
                  {createProject.isPending ? "Creating…" : "Create"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="tm-btn-secondary flex-1 py-2.5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit form modal */}
      {showEditForm && (
        <div className="tm-modal-overlay">
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

      {/* Project list */}
      {isLoading ? (
        <p style={{ color: "var(--color-muted)" }}>Loading…</p>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">◫</p>
          <p className="font-medium" style={{ color: "var(--color-text)" }}>No projects yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
                borderColor: "var(--color-border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold" style={{ color: "var(--color-text)" }}>{project.name}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      background: "rgba(129, 140, 248, 0.12)",
                      color: "var(--color-accent)",
                      border: "1px solid rgba(129, 140, 248, 0.25)",
                    }}
                  >
                    {project._count?.tasks ?? 0} tasks
                  </span>
                  {(isAdmin || project.owner?.id === currentUser?.id) && (
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditFormData({ id: project.id, name: project.name, description: project.description || "" }); setShowEditForm(true); }}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                        style={{ color: "var(--color-muted)" }}
                        title="Edit Project"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(project.id, project.name); }}
                        className="p-1 rounded hover:bg-red-500/10 transition-colors text-red-500"
                        title="Delete Project"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm line-clamp-2 mb-4" style={{ color: "var(--color-muted)" }}>
                {project.description ?? "No description"}
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                {project._count?.members ?? 0} member{project._count?.members !== 1 ? "s" : ""} ·{" "}
                {project.owner?.name}
              </p>
            </Link>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

export default Projects;
