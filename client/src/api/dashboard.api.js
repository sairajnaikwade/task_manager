import client from "./client";

export const getDashboard = () =>
  client.post("/dashboard", { data: {} });
