const STATUS_STYLES = {
  todo: {
    bg: "rgba(148, 163, 184, 0.12)",
    color: "#94a3b8",
    border: "rgba(148, 163, 184, 0.25)",
    label: "To Do",
  },
  in_progress: {
    bg: "rgba(96, 165, 250, 0.12)",
    color: "#7dd3fc",
    border: "rgba(96, 165, 250, 0.3)",
    label: "In Progress",
  },
  done: {
    bg: "rgba(52, 211, 153, 0.12)",
    color: "#6ee7b7",
    border: "rgba(52, 211, 153, 0.28)",
    label: "Done",
  },
  overdue: {
    bg: "rgba(248, 113, 113, 0.12)",
    color: "#fca5a5",
    border: "rgba(248, 113, 113, 0.35)",
    label: "Overdue",
  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] ?? {
    bg: "rgba(148, 163, 184, 0.12)",
    color: "#94a3b8",
    border: "rgba(148, 163, 184, 0.2)",
    label: status,
  };

  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{
        background: s.bg,
        color: s.color,
        borderColor: s.border,
        boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
      }}
    >
      {s.label}
    </span>
  );
};

export default StatusBadge;
