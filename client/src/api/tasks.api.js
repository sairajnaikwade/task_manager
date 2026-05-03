import client from "./client";

export const listTasks = (data = {}) =>
  client.post("/tasks/list", { data });

export const createTask = (data) =>
  client.post("/tasks/create", { data });

export const getTask = (id) =>
  client.get(`/tasks/${id}`);

export const updateTask = (data) =>
  client.post("/tasks/update", { data });

export const deleteTask = (data) =>
  client.post("/tasks/delete", { data });

export const addTaskComment = (id, content) =>
  client.post(`/tasks/${id}/comments`, { data: { content } });
