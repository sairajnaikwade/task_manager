import { useQuery } from "@tanstack/react-query";
import { listAllUsers } from "../api/users.api";

export const useUserDirectory = () =>
  useQuery({
    queryKey: ["user_directory"],
    queryFn: () => listAllUsers().then((r) => r.data.data.items),
  });
