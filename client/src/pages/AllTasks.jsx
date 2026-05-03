import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";
import StatusBadge from "../components/tasks/StatusBadge";
import { useTasks } from "../hooks/useTasks";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "todo", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "done", label: "Done" },
  { id: "overdue", label: "Overdue" },
];

const AllTasks = () => {
  const [filter, setFilter] = useState("all");

  const taskFilters = useMemo(() => {
    if (filter === "all") return {};
    if (filter === "overdue") return { is_overdue: true };
    return { status: [filter] };
  }, [filter]);

  const { data: tasksData, isLoading, isError } = useTasks(taskFilters);
  const tasks = tasksData?.items ?? [];

  return (
    <PageWrapper title="All Tasks">
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {FILTERS.map(({ id, label }) => {
          const active = filter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200"
              style={
                active
                  ? {
                      background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                      color: "#fff",
                      boxShadow: "0 4px 16px -4px rgba(99, 102, 241, 0.55)",
                    }
                  : {
                      background: "var(--color-bg-subtle)",
                      color: "var(--color-muted)",
                      border: "1px solid var(--color-border)",
                    }
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{
          background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
          borderColor: "var(--color-border-strong)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {isLoading ? (
          <p className="text-sm text-[var(--color-muted)]">Loading tasks…</p>
        ) : isError ? (
          <p className="text-sm text-[var(--color-danger)]">Failed to load tasks.</p>
        ) : tasks.length === 0 ? (
          <div className="py-20 text-center">
            <p className="mb-3 text-4xl opacity-40">📋</p>
            <p className="font-semibold text-[var(--color-text)]">No tasks found</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Try another filter or create a task in a project.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => {
              const isOverdue =
                task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";
              return (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="flex items-center justify-between rounded-xl border p-4 transition-all duration-200 hover:-translate-y-px"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-bg-subtle)",
                    boxShadow: "0 2px 12px -4px rgba(0,0,0,0.35)",
                  }}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        background: isOverdue
                          ? "#f87171"
                          : task.status === "done"
                            ? "#34d399"
                            : task.status === "in_progress"
                              ? "#7dd3fc"
                              : "#fbbf24",
                        boxShadow: `0 0 10px -2px ${
                          isOverdue
                            ? "#f87171"
                            : task.status === "done"
                              ? "#34d399"
                              : "#60a5fa"
                        }`,
                      }}
                    />
                    <div>
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">{task.title}</p>
                      <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                        {task.project?.name} · {task.assignee ? task.assignee.name : "Unassigned"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={isOverdue ? "overdue" : task.status} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AllTasks;
