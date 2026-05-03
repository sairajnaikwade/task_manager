import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listProjects, createProject, getProject, updateProject, deleteProject } from "../api/projects.api";

export const useProjects = (filters = {}) =>
  useQuery({
    queryKey: ["projects", filters],
    queryFn:  () => listProjects(filters).then((r) => r.data.data),
  });

export const useProject = (id) =>
  useQuery({
    queryKey: ["project", id],
    queryFn:  () => getProject(id).then((r) => r.data.data.project),
    enabled:  !!id,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createProject(data).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateProject(data).then((r) => r.data),
    onSuccess:  (_, vars) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["project", vars.project_id] });
    },
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => deleteProject(data).then((r) => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
};
