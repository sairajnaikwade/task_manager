import client from "./client";

export const listUsers = () =>
  client.post("/admin/list");

export const updateUserRole = (payload) =>
  client.post("/admin/role", { data: payload });

export const createUser = (payload) =>
  client.post("/admin/create", { data: payload });

export const deleteUser = (payload) =>
  client.post("/admin/delete", { data: payload });
