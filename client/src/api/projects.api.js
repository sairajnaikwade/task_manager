import client from "./client";

export const listProjects = (data = {}) =>
  client.post("/projects/list", { data });

export const createProject = (data) =>
  client.post("/projects/create", { data });

export const getProject = (id) =>
  client.get(`/v1/projects/${id}`);

export const updateProject = (data) =>
  client.post("/projects/update", { data });

export const deleteProject = (data) =>
  client.post("/projects/delete", { data });
