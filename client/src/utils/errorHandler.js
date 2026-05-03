/**
 * Frontend-owned message string table keyed by msgid.
 * Placeholders: {field} and {vals.0}, {vals.1}, etc.
 */
const MESSAGE_TEMPLATES = {
  1:  "{field} is required",
  2:  "{field} is invalid",
  3:  "{field} was not found",
  4:  "Unauthorized — please log in",
  5:  "You do not have permission to perform this action",
  6:  "{field} already exists",
  7:  "Your session has expired — please log in again",
  8:  "An internal server error occurred",
  12: "API version '{vals.0}' is not supported",
  20: "Incorrect password",
  21: "An account with this email already exists",
};

/**
 * Resolves a single error message object to a display string.
 * @param {{ errcode: string, msgid: number, field: string, vals: any[] }} msg
 */
export const resolveMessage = ({ msgid, field = "", vals = [] }) => {
  let template = MESSAGE_TEMPLATES[msgid] ?? `Unknown error (${msgid})`;
  template = template.replace("{field}", field);
  vals.forEach((v, i) => {
    template = template.replace(`{vals.${i}}`, String(v));
  });
  return template;
};

/**
 * Resolves an array of error message objects from an API response.
 * Returns an array of human-readable strings.
 */
export const resolveMessages = (messages = []) =>
  messages.map(resolveMessage);

/**
 * Returns the first resolved message string, or a default fallback.
 */
export const getFirstError = (messages = [], fallback = "Something went wrong") => {
  const resolved = resolveMessages(messages);
  return resolved[0] ?? fallback;
};
