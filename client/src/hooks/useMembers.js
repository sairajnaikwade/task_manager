import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMember, removeMember } from "../api/members.api";

export const useAddMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => addMember(data).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["project", vars.project_id] });
    },
  });
};

export const useRemoveMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => removeMember(data).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["project", vars.project_id] });
    },
  });
};
