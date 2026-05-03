import client from "./client";

export const listAllUsers = () =>
  client.post("/users/list");
