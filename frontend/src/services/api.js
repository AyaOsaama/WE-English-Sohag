// Single HTTP client. Every service module goes through request(), so auth headers,
// JSON handling and error shape are handled in one place.
const BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'we_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, formData, raw } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: formData || (body ? JSON.stringify(body) : undefined) });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection.', 0);
  }
  if (raw) {
    if (!res.ok) throw new ApiError('Could not load file', res.status);
    return res.blob();
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    if (res.status === 401 && token) window.dispatchEvent(new Event('we:unauthorized'));
    throw new ApiError(json?.message || `Request failed (${res.status})`, res.status);
  }
  return json.data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: body ?? {} }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => request(path, { method: 'POST', formData }),
  blob: (path) => request(path, { raw: true }),
};
