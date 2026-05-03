import db from "../../config/db.js";
import { success } from "../../utils/response.js";

export const listAllUsers = async (req, res) => {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });
  return success(res, { items: users });
};
