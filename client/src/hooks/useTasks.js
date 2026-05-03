import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listTasks, createTask, getTask, updateTask, deleteTask, addTaskComment } from "../api/tasks.api";

const assertApiSuccess = (axiosResponse) => {
  const body = axiosResponse?.data;
  if (body?.status !== "success") {
    const m = body?.messages?.[0];
    const fromVals =
      Array.isArray(m?.vals) && m.vals.length ? String(m.vals[0]) : "";
    throw new Error(fromVals || m?.errcode || "Request failed");
  }
  return body;
};

export const useTasks = (filters = {}) =>
  useQuery({
    queryKey: ["tasks", filters],
    queryFn:  () => listTasks(filters).then((r) => r.data.data),
  });

export const useTask = (id) =>
  useQuery({
    queryKey: ["task", id],
    queryFn:  () => getTask(id).then((r) => r.data.data.task),
    enabled:  !!id,
  });

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createTask(data).then(assertApiSuccess),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateTask(data).then(assertApiSuccess),
    onSuccess:  (_, vars) => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["task", vars.task_id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => deleteTask(data).then(assertApiSuccess),
    onSuccess:  (_, vars) => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      if (vars?.task_id) qc.invalidateQueries({ queryKey: ["task", vars.task_id] });
    },
  });
};

export const useAddComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ task_id, content }) =>
      addTaskComment(task_id, content).then(assertApiSuccess),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["task", vars.task_id] }),
  });
};
