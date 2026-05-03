import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listUsers, updateUserRole, createUser, deleteUser } from "../api/admin.api";

export const useUsers = () =>
  useQuery({
    queryKey: ["admin_users"],
    queryFn: () => listUsers().then((r) => r.data.data),
  });

export const useUpdateUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_users"] }),
  });
};

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_users"] }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_users"] }),
  });
};
