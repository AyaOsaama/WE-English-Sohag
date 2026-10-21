const mongoose = require('mongoose');
const { ApiError } = require('./ApiError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireFields(body, fields) {
  for (const f of fields) {
    if (body[f] === undefined || body[f] === null || body[f] === '') {
      throw new ApiError(400, `${f} is required`);
    }
  }
}

function assertEmail(email) {
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) throw new ApiError(400, 'A valid email is required');
}

function assertPassword(pw) {
  if (typeof pw !== 'string' || pw.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');
}

function assertObjectId(id, label = 'id') {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, `Invalid ${label}`);
}

// Strip keys starting with "$" or containing "." to block NoSQL operator injection.
function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith('$') || k.includes('.')) continue;
      out[k] = sanitize(v);
    }
    return out;
  }
  return value;
}

function pick(obj, keys) {
  const out = {};
  for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
}

module.exports = { requireFields, assertEmail, assertPassword, assertObjectId, sanitize, pick };
