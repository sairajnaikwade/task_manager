import client from "./client";

export const listMembers = (data) =>
  client.post("/members/list", { data });

export const addMember = (data) =>
  client.post("/members/add", { data });

export const removeMember = (data) =>
  client.post("/members/remove", { data });
