import { useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import StatusBadge from "../components/tasks/StatusBadge";
import { useTask, useUpdateTask, useAddComment } from "../hooks/useTasks";

const TaskDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "view"; // Default to view
  const { data: task, isLoading } = useTask(id);
  const updateTaskMutation = useUpdateTask();
  const addCommentMutation = useAddComment();
  const [newComment, setNewComment] = useState("");

  if (isLoading) return <PageWrapper><p style={{ color: "var(--color-muted)" }}>Loading…</p></PageWrapper>;
  if (!task)     return <PageWrapper><p style={{ color: "var(--color-danger)" }}>Task not found.</p></PageWrapper>;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";

  const currentUser = (() => { try { return JSON.parse(sessionStorage.getItem("user")); } catch { return null; } })();
  const isAdmin = currentUser?.role === "admin";
  const isAssignee = task.assigned_to === currentUser?.id;
  const isCreator = task.created_by === currentUser?.id;
  const canUpdateStatus = (isAdmin || isAssignee || isCreator) && mode === "edit";
  const canPostComment = mode === "edit";

  const handlePriorityChange = async (e) => {
    try {
      await updateTaskMutation.mutateAsync({ task_id: task.id, priority: e.target.value });
    } catch {
      alert("Failed to update priority.");
    }
  };

  const handleStatusChange = async (e) => {
    try {
      await updateTaskMutation.mutateAsync({ task_id: task.id, status: e.target.value });
    } catch (err) {
      const msg = err.response?.data?.messages?.[0]?.message || "Failed to update status.";
      alert(msg);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await addCommentMutation.mutateAsync({ task_id: task.id, content: newComment });
      setNewComment("");
    } catch {
      alert("Failed to add comment.");
    }
  };

  return (
    <PageWrapper title={mode === "edit" ? "Edit Task" : "Task Details"}>
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <Link to={`/projects/${task.project?.id}`}
              className="text-sm hover:opacity-80"
              style={{ color: "var(--color-accent)" }}>
              ← {task.project?.name}
            </Link>
          </div>

          <div
            className="mb-8 rounded-2xl border p-8"
            style={{
              background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
              borderColor: "var(--color-border-strong)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>{task.title}</h1>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={isOverdue ? "overdue" : task.status} />
                <select 
                  value={task.status}
                  disabled={!canUpdateStatus}
                  onChange={handleStatusChange}
                  className={`bg-transparent border rounded px-2 py-1 text-[10px] uppercase font-bold outline-none focus:ring-1 ${canUpdateStatus ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                  style={{ borderColor: "var(--color-border)", color: "var(--color-muted)", focusRingColor: "var(--color-accent)" }}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Completed</option>
                </select>
              </div>
            </div>

            {task.description && (
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--color-muted)" }}>
                {task.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
              <div>
                <p className="font-medium mb-1" style={{ color: "var(--color-muted)" }}>Assigned to</p>
                <p style={{ color: "var(--color-text)" }}>{task.assignee?.name ?? "Unassigned"}</p>
              </div>
              <div>
                <p className="font-medium mb-1" style={{ color: "var(--color-muted)" }}>Created by</p>
                <p style={{ color: "var(--color-text)" }}>{task.creator?.name}</p>
              </div>
              <div>
                <p className="font-medium mb-1" style={{ color: "var(--color-muted)" }}>Priority</p>
                <select 
                  value={task.priority}
                  disabled={!isAdmin && !isCreator || mode !== "edit"}
                  onChange={handlePriorityChange}
                  className={`bg-transparent border rounded px-2 py-1 text-xs outline-none focus:ring-1 ${(!isAdmin && !isCreator || mode !== "edit") ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)", focusRingColor: "var(--color-accent)" }}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <p className="font-medium mb-1" style={{ color: "var(--color-muted)" }}>Due date</p>
                <p style={{ color: isOverdue ? "var(--color-danger)" : "var(--color-text)" }}>
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                </p>
              </div>
              <div>
                <p className="font-medium mb-1" style={{ color: "var(--color-muted)" }}>Project</p>
                <Link to={`/projects/${task.project?.id}`} style={{ color: "var(--color-accent)" }}>
                  {task.project?.name}
                </Link>
              </div>
              <div>
                <p className="font-medium mb-1" style={{ color: "var(--color-muted)" }}>Created</p>
                <p style={{ color: "var(--color-text)" }}>{new Date(task.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Comment Thread */}
          <div
            className="rounded-2xl border p-8"
            style={{
              background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
              borderColor: "var(--color-border-strong)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <h3 className="mb-6 text-lg font-bold tracking-tight text-[var(--color-text)]">Comments</h3>
            
            <div className="space-y-6 mb-8">
              {task.comments?.length === 0 ? (
                <p className="text-sm italic" style={{ color: "var(--color-muted)" }}>No comments yet.</p>
              ) : (
                task.comments?.map(comment => (
                  <div key={comment.id} className="border-l-2 pl-4 py-1" style={{ borderColor: "var(--color-accent)" }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold" style={{ color: "var(--color-text)" }}>{comment.author.name}</span>
                      <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--color-muted)" }}>{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {canPostComment ? (
              <form onSubmit={handleAddComment}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a note..."
                  className="tm-input mb-4 h-24 resize-none"
                />
                <button type="submit" disabled={addCommentMutation.isPending} className="tm-btn-primary px-6 py-2.5">
                  {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
                </button>
              </form>
            ) : (
              <p className="text-xs italic" style={{ color: "var(--color-muted)" }}>
                Commenting is disabled in view-only mode.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar / Context Info */}
        <div className="hidden lg:block">
          <div
            className="sticky top-8 rounded-2xl border p-6"
            style={{
              background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
              borderColor: "var(--color-border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--color-muted)" }}>Quick Stats</h4>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "var(--color-muted)" }}>Current Status</p>
                <StatusBadge status={isOverdue ? "overdue" : task.status} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "var(--color-muted)" }}>Priority</p>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full`} 
                  style={{ 
                    background: task.priority === 'urgent' ? '#ef444422' : task.priority === 'high' ? '#f9731622' : task.priority === 'normal' ? '#3b82f622' : '#10b98122',
                    color: task.priority === 'urgent' ? '#ef4444' : task.priority === 'high' ? '#f97316' : task.priority === 'normal' ? '#3b82f6' : '#10b981',
                    border: `1px solid ${task.priority === 'urgent' ? '#ef444444' : task.priority === 'high' ? '#f9731644' : task.priority === 'normal' ? '#3b82f644' : '#10b98144'}`
                  }}>
                  {task.priority}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default TaskDetail;
