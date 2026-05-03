/**
 * Centralized error code dictionary.
 * The frontend owns the human-readable message strings (keyed by msgid).
 * Backend only emits { errcode, msgid, field, vals }.
 */
export const ERR = {
  MISSING:        { errcode: "missing",        msgid: 1  },
  INVALID:        { errcode: "invalid",        msgid: 2  },
  NOT_FOUND:      { errcode: "not_found",      msgid: 3  },
  UNAUTHORIZED:   { errcode: "unauthorized",   msgid: 4  },
  FORBIDDEN:      { errcode: "forbidden",      msgid: 5  },
  CONFLICT:       { errcode: "conflict",       msgid: 6  },
  AUTH_EXP:       { errcode: "authexp",        msgid: 7  },
  INTERNAL:       { errcode: "internal",       msgid: 8  },
  BAD_VER:        { errcode: "invalid",        msgid: 12 },
  WRONG_PASSWORD: { errcode: "invalid",        msgid: 20 },
  EMAIL_TAKEN:    { errcode: "conflict",       msgid: 21 },
};

/**
 * Build an error message object.
 * @param {object} errDef - from ERR dict
 * @param {string} field  - field name
 * @param {any[]}  vals   - template values
 */
export const makeErr = (errDef, field = "", vals = []) => ({
  errcode: errDef.errcode,
  msgid:   errDef.msgid,
  field,
  vals,
});
