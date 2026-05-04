import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  Trash2,
  Settings,
  AlertTriangle,
  CheckCircle2,
  List,
  Sparkles,
  Filter,
  Edit2,
} from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import StatusBadge from "../components/tasks/StatusBadge";
import { getDashboard } from "../api/dashboard.api";
import { useTasks, useDeleteTask } from "../hooks/useTasks";

const StatCard = ({ label, value, color, icon, onClick, active }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ${
      active ? "" : "hover:-translate-y-0.5 hover:shadow-lg"
    }`}
    style={{
      background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
      borderColor: active ? color : "var(--color-border)",
      boxShadow: active
        ? `0 0 0 2px ${color}, 0 20px 50px -20px rgba(0,0,0,0.5)`
        : "var(--shadow-card)",
    }}
  >
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
      style={{
        background: `${color}18`,
        boxShadow: `0 0 20px -6px ${color}66`,
        color,
      }}
    >
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xl sm:text-2xl font-bold tabular-nums tracking-tight" style={{ color }}>
        {value ?? "—"}
      </p>
      <p className="text-[10px] sm:text-[11px] font-bold uppercase text-[var(--color-muted)] truncate" title={label}>{label}</p>
    </div>
  </button>
);

const SortIcon = ({ column, sortConfig }) => {
  if (sortConfig.key !== column) return <span className="opacity-30 ml-1 text-[10px]">⇕</span>;
  return sortConfig.direction === 'asc' ? <span className="ml-1 text-[10px]">↑</span> : <span className="ml-1 text-[10px]">↓</span>;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({ 
    status: [], 
    assignee_id: [], 
    date: [], 
    priority: [],
    specific_date: "" 
  });
  const [tempFilters, setTempFilters] = useState({ 
    status: [], 
    assignee_id: [], 
    date: [], 
    priority: [],
    specific_date: ""
  });
  const [activeFilterCategory, setActiveFilterCategory] = useState("status");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const deleteTaskMutation = useDeleteTask();

  const currentUser = (() => { try { return JSON.parse(sessionStorage.getItem("user")); } catch { return null; } })();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard().then((r) => r.data.data),
  });

  const taskFilters = useMemo(() => {
    if (activeFilter === "all") return {};
    if (activeFilter === "overdue") return { is_overdue: true };
    if (activeFilter === "deleted") return { is_deleted: true };
    return { status: [activeFilter] };
  }, [activeFilter]);

  const { data: tasksData, isLoading: tasksLoading } = useTasks({ filter: taskFilters });

  const tasksList = useMemo(() => tasksData?.items ?? [], [tasksData]);

  const uniqueMembers = useMemo(() => {
    const map = new Map();
    tasksList.forEach(t => {
      if (t.assignee) map.set(t.assignee.id, t.assignee);
    });
    return Array.from(map.values());
  }, [tasksList]);
  const processedTasks = useMemo(() => {
    let result = [...tasksList];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || t.project?.name.toLowerCase().includes(q));
    }

    if (advancedFilters.status.length > 0) {
      result = result.filter(t => advancedFilters.status.includes(t.status));
    }
    if (advancedFilters.assignee_id.length > 0) {
      result = result.filter(t => advancedFilters.assignee_id.includes(t.assignee?.id));
    }
    // Date filters
    if (advancedFilters.date.length > 0) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      result = result.filter(t => {
        if (!t.due_date) return false;
        const d = new Date(t.due_date);
        d.setHours(0, 0, 0, 0);
        const matchesOverdue = advancedFilters.date.includes('overdue') && d < now && t.status !== 'done';
        const matchesUpcoming = advancedFilters.date.includes('upcoming') && d >= now;
        return matchesOverdue || matchesUpcoming;
      });
    }

    // Specific Date filter
    if (advancedFilters.specific_date) {
      const targetDate = new Date(advancedFilters.specific_date);
      targetDate.setHours(0, 0, 0, 0);
      result = result.filter(t => {
        if (!t.due_date) return false;
        const d = new Date(t.due_date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === targetDate.getTime();
      });
    }

    if (advancedFilters.priority.length > 0) {
      result = result.filter(t => advancedFilters.priority.includes(t.priority));
    }

    result.sort((a, b) => {
      const valA = a[sortConfig.key] || "";
      const valB = b[sortConfig.key] || "";
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasksList, searchQuery, sortConfig, advancedFilters]);

  const totalPages = Math.max(1, Math.ceil(processedTasks.length / pageSize));
  const displayPage = Math.min(currentPage, totalPages);
  const paginatedTasks = useMemo(() => {
    const start = (displayPage - 1) * pageSize;
    return processedTasks.slice(start, start + pageSize);
  }, [processedTasks, displayPage, pageSize]);

  if (isLoading) return <PageWrapper title="Dashboard"><p style={{ color: "var(--color-muted)" }}>Loading…</p></PageWrapper>;
  if (isError)   return <PageWrapper title="Dashboard"><p style={{ color: "var(--color-danger)" }}>Failed to load dashboard.</p></PageWrapper>;

  const { total_tasks, by_status, overdue, deleted: deletedCount } = data ?? {};

  const handleSort = (key) => {
    setCurrentPage(1);
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getListTitle = () => {
    if (activeFilter === "all") return "All Tasks";
    if (activeFilter === "overdue") return "Overdue Tasks";
    if (activeFilter === "todo") return "To Do Tasks";
    if (activeFilter === "in_progress") return "In Progress Tasks";
    if (activeFilter === "done") return "Done Tasks";
    if (activeFilter === "deleted") return "Deleted Tasks";
    return "Tasks";
  };

  return (
    <PageWrapper title="Dashboard">
      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        <StatCard label="All Tasks"    value={total_tasks}         color="#6366f1" icon={<List size={20} />} active={activeFilter === "all"} onClick={() => { setCurrentPage(1); setActiveFilter("all"); }} />
        <StatCard label="New"          value={by_status?.todo}      color="#a855f7" icon={<Sparkles size={20} />} active={activeFilter === "todo"} onClick={() => { setCurrentPage(1); setActiveFilter("todo"); }} />
        <StatCard label="In Progress"   value={by_status?.in_progress} color="#60a5fa" icon={<Settings size={20} />} active={activeFilter === "in_progress"} onClick={() => { setCurrentPage(1); setActiveFilter("in_progress"); }} />
        <StatCard label="Completed"     value={by_status?.done}      color="#10b981" icon={<CheckCircle2 size={20} />} active={activeFilter === "done"} onClick={() => { setCurrentPage(1); setActiveFilter("done"); }} />
        <StatCard label="Overdue"        value={overdue}              color="#f87171" icon={<AlertTriangle size={20} />} active={activeFilter === "overdue"} onClick={() => { setCurrentPage(1); setActiveFilter("overdue"); }} />
        <StatCard label="Deleted"        value={deletedCount}        color="#94a3b8" icon={<Trash2 size={20} />} active={activeFilter === "deleted"} onClick={() => { setCurrentPage(1); setActiveFilter("deleted"); }} />
      </div>

      {/* Filtered tasks */}
      <div
        className="flex flex-col rounded-2xl border"
        style={{
          background: "linear-gradient(165deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)",
          borderColor: "var(--color-border-strong)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          className="flex flex-col items-start justify-between gap-4 border-b p-6 sm:flex-row sm:items-center"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold tracking-tight text-[var(--color-text)]">{getListTitle()}</h2>
            {tasksLoading && <span className="text-xs" style={{ color: "var(--color-muted)" }}>Loading...</span>}
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto relative">
            <div className="relative">
              <button 
                onClick={() => {
                  if (!showFilters) setTempFilters(advancedFilters);
                  setShowFilters(!showFilters);
                }}
                className="relative flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/[0.04]"
                style={{ background: showFilters ? "var(--color-bg-subtle)" : "transparent", borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                <Filter size={16} /> Filter
                {(advancedFilters.status.length > 0 || advancedFilters.assignee_id.length > 0 || advancedFilters.date.length > 0 || advancedFilters.priority.length > 0 || advancedFilters.specific_date) && (
                  <span className="w-2 h-2 rounded-full absolute top-1 right-2" style={{ background: "var(--color-accent)" }}></span>
                )}
              </button>
              
              {showFilters && (
                <div className="absolute right-0 top-full mt-2 w-[280px] sm:w-[480px] max-w-[calc(100vw-2rem)] rounded-xl shadow-2xl border z-50 flex flex-col overflow-hidden" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                  <div className="flex h-64">
                    {/* Sidebar Categories */}
                    <div className="w-28 sm:w-36 border-r flex flex-col shrink-0" style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.02)" }}>
                      {[
                        { id: 'status', label: 'Status' },
                        { id: 'priority', label: 'Priority' },
                        { id: 'date', label: 'Date' },
                        { id: 'assignee_id', label: 'Assigned To' }
                      ].map(cat => (
                        <button 
                          key={cat.id}
                          onClick={() => setActiveFilterCategory(cat.id)}
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${activeFilterCategory === cat.id ? 'bg-blue-500/10 text-blue-400' : 'text-gray-400 hover:bg-white/5'}`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Options Content */}
                    <div className="flex-1 p-4 overflow-y-auto">
                      <div className="flex flex-col gap-3">
                        {activeFilterCategory === 'status' && ['todo', 'in_progress', 'done'].map(s => (
                          <label key={s} className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-80 group">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-transparent text-blue-600 focus:ring-blue-500"
                              checked={tempFilters.status.includes(s)}
                              onChange={(e) => {
                                const newSt = e.target.checked 
                                  ? [...tempFilters.status, s] 
                                  : tempFilters.status.filter(x => x !== s);
                                setTempFilters({...tempFilters, status: newSt});
                              }}
                            />
                            <span className="capitalize" style={{ color: "var(--color-text)" }}>{s.replace('_', ' ')}</span>
                          </label>
                        ))}

                        {activeFilterCategory === 'priority' && ['low', 'normal', 'high', 'urgent'].map(p => (
                          <label key={p} className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-80 group">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-transparent text-blue-600 focus:ring-blue-500"
                              checked={tempFilters.priority.includes(p)}
                              onChange={(e) => {
                                const newPr = e.target.checked 
                                  ? [...tempFilters.priority, p] 
                                  : tempFilters.priority.filter(x => x !== p);
                                setTempFilters({...tempFilters, priority: newPr});
                              }}
                            />
                            <span className="capitalize" style={{ color: "var(--color-text)" }}>{p}</span>
                          </label>
                        ))}

                        {activeFilterCategory === 'date' && (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                              {['overdue', 'upcoming'].map(d => (
                                <label key={d} className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-80 group">
                                  <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-transparent text-blue-600 focus:ring-blue-500"
                                    checked={tempFilters.date.includes(d)}
                                    onChange={(e) => {
                                      const newDt = e.target.checked 
                                        ? [...tempFilters.date, d] 
                                        : tempFilters.date.filter(x => x !== d);
                                      setTempFilters({...tempFilters, date: newDt});
                                    }}
                                  />
                                  <span className="capitalize" style={{ color: "var(--color-text)" }}>{d}</span>
                                </label>
                              ))}
                            </div>
                            <div className="pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
                              <p className="text-[10px] font-bold uppercase mb-2" style={{ color: "var(--color-muted)" }}>Specific Date</p>
                              <input 
                                type="date"
                                value={tempFilters.specific_date}
                                onChange={(e) => setTempFilters({...tempFilters, specific_date: e.target.value})}
                                className="w-full bg-transparent border rounded px-3 py-2 text-xs outline-none focus:ring-1"
                                style={{ borderColor: "var(--color-border)", color: "var(--color-text)", focusRingColor: "var(--color-accent)" }}
                              />
                            </div>
                          </div>
                        )}

                        {activeFilterCategory === 'assignee_id' && uniqueMembers.map(m => (
                          <label key={m.id} className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-80 group">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-transparent text-blue-600 focus:ring-blue-500"
                              checked={tempFilters.assignee_id.includes(m.id)}
                              onChange={(e) => {
                                const newM = e.target.checked 
                                  ? [...tempFilters.assignee_id, m.id] 
                                  : tempFilters.assignee_id.filter(x => x !== m.id);
                                setTempFilters({...tempFilters, assignee_id: newM});
                              }}
                            />
                            <span className="truncate" style={{ color: "var(--color-text)" }}>{m.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-3 border-t flex justify-between items-center" style={{ borderColor: "var(--color-border)", background: "rgba(0,0,0,0.1)" }}>
                    <button 
                      onClick={() => {
                        const cleared = { status: [], assignee_id: [], date: [], priority: [], specific_date: "" };
                        setCurrentPage(1);
                        setTempFilters(cleared);
                        setAdvancedFilters(cleared);
                        setShowFilters(false);
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                    >
                      Clear All
                    </button>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowFilters(false)}
                        className="px-4 py-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          setCurrentPage(1);
                          setAdvancedFilters(tempFilters);
                          setShowFilters(false);
                        }}
                        className="px-4 py-1.5 text-xs font-bold text-white rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => { setCurrentPage(1); setSearchQuery(e.target.value); }}
              className="tm-input w-full sm:w-72"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr
                className="border-b text-[11px] font-bold uppercase tracking-widest"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-bg-subtle)",
                  color: "var(--color-muted)",
                }}
              >
                <th className="cursor-pointer px-6 py-4 transition-colors select-none hover:text-[var(--color-text)]" onClick={() => handleSort('title')}>
                  Title <SortIcon column="title" sortConfig={sortConfig} />
                </th>
                <th className="cursor-pointer px-6 py-4 transition-colors select-none hover:text-[var(--color-text)]" onClick={() => handleSort('project_id')}>
                  Project <SortIcon column="project_id" sortConfig={sortConfig} />
                </th>
                <th className="cursor-pointer px-6 py-4 transition-colors select-none hover:text-[var(--color-text)]" onClick={() => handleSort('status')}>
                  Status <SortIcon column="status" sortConfig={sortConfig} />
                </th>
                <th className="cursor-pointer px-6 py-4 transition-colors select-none hover:text-[var(--color-text)]" onClick={() => handleSort('priority')}>
                  Priority <SortIcon column="priority" sortConfig={sortConfig} />
                </th>
                <th className="cursor-pointer px-6 py-4 transition-colors select-none hover:text-[var(--color-text)]" onClick={() => handleSort('due_date')}>
                  Deadline <SortIcon column="due_date" sortConfig={sortConfig} />
                </th>
                <th className="px-6 py-4">Assignee</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-sm" style={{ color: "var(--color-muted)" }}>
                    No tasks found.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task) => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";
                  
                  const formatDate = (d) => {
                    if (!d) return "—";
                    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  };

                  return (
                    <tr
                      key={task.id}
                      className="group cursor-pointer border-b transition-colors last:border-0 hover:bg-black/[0.02]"
                      style={{ borderColor: "var(--color-border)" }}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      <td className="px-6 py-4">
                        <p
                          className="text-sm font-medium text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]"
                        >
                          {task.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm" style={{ color: "var(--color-muted)" }}>{task.project?.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={isOverdue ? "overdue" : task.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full`} 
                          style={{ 
                            background: task.priority === 'urgent' ? '#ef444422' : task.priority === 'high' ? '#f9731622' : task.priority === 'normal' ? '#3b82f622' : '#10b98122',
                            color: task.priority === 'urgent' ? '#ef4444' : task.priority === 'high' ? '#f97316' : task.priority === 'normal' ? '#3b82f6' : '#10b981',
                            border: `1px solid ${task.priority === 'urgent' ? '#ef444444' : task.priority === 'high' ? '#f9731644' : task.priority === 'normal' ? '#3b82f644' : '#10b98144'}`
                          }}>
                        {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm" style={{ color: "var(--color-muted)" }}>{formatDate(task.due_date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        {task.assignee ? (
                          <div>
                            <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{task.assignee.name}</p>
                            <p className="text-[10px]" style={{ color: "var(--color-muted)" }}>{task.assignee.email}</p>
                          </div>
                        ) : (
                          <p className="text-sm" style={{ color: "var(--color-muted)" }}>Unassigned</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/tasks/${task.id}?mode=view`}
                          className="rounded-lg p-1.5 text-[var(--color-muted)] transition-colors hover:bg-black/[0.04] hover:text-[var(--color-accent)]"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        
                        {activeFilter !== 'deleted' && (
                          <>
                            <Link
                              to={`/tasks/${task.id}?mode=edit`}
                              className="rounded-lg p-1.5 text-[var(--color-muted)] transition-colors hover:bg-black/[0.04] hover:text-[var(--color-accent)]"
                              title="Edit Task"
                            >
                              <Edit2 size={18} />
                            </Link>

                            {(currentUser?.role === 'admin' || task.assignee?.id === currentUser?.id || task.creator?.id === currentUser?.id) && (
                              <button 
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (window.confirm("Delete this task?")) {
                                    try {
                                      await deleteTaskMutation.mutateAsync({ task_id: task.id });
                                      alert("Task deleted successfully.");
                                    } catch {
                                      alert("Failed to delete task.");
                                    }
                                  }
                                }}
                                className="rounded-lg p-1.5 text-[var(--color-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                                title="Delete Task"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between border-t p-4"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg-subtle)" }}
          >
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              Showing <span className="font-semibold" style={{ color: "var(--color-text)" }}>{(displayPage - 1) * pageSize + 1}</span> to <span className="font-semibold" style={{ color: "var(--color-text)" }}>{Math.min(displayPage * pageSize, processedTasks.length)}</span> of <span className="font-semibold" style={{ color: "var(--color-text)" }}>{processedTasks.length}</span> results
            </p>
            <div className="flex gap-2">
              <button 
                disabled={displayPage === 1}
                onClick={() => setCurrentPage(displayPage - 1)}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${displayPage === i + 1 ? "text-white shadow-md" : "text-[var(--color-muted)] hover:bg-white/[0.05]"}`}
                    style={
                      displayPage === i + 1
                        ? {
                            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                            boxShadow: "0 4px 14px -4px rgba(99, 102, 241, 0.6)",
                          }
                        : undefined
                    }
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                disabled={displayPage === totalPages}
                onClick={() => setCurrentPage(displayPage + 1)}
                className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
