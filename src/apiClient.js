// Thin wrapper around the /api/v1 REST API. Same-origin in both dev (served by
// the Vite dev server) and production (a Vercel function next to the static
// build), so the session cookie travels on its own and no token is kept in JS
// storage.

const BASE = '/api/v1';

let csrfToken = null;
export const setCsrfToken = (token) => { csrfToken = token; };
export const getCsrfToken = () => csrfToken;

export class ApiError extends Error {
  constructor(message, { code = 'error', status = 0, field = null } = {}) {
    super(message);
    this.code = code;
    this.status = status;
    this.field = field;
  }
}

async function request(path, { method = 'GET', body, form, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET' && csrfToken) headers['X-CSRF-Token'] = csrfToken;

  let response;
  try {
    response = await fetch(BASE + path, {
      method,
      headers,
      credentials: 'same-origin',
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Could not reach the server. Check that the API is running.', { code: 'network' });
  }

  const text = await response.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch { /* non-JSON error page */ }

  if (!response.ok) {
    const error = payload?.error;
    throw new ApiError(error?.message || `Request failed (${response.status}).`, {
      code: error?.code || 'error',
      status: response.status,
      field: error?.field || null
    });
  }
  return payload;
}

const qs = (params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value) ? value.length : value) search.set(key, Array.isArray(value) ? value.join(',') : value);
  });
  const string = search.toString();
  return string ? `?${string}` : '';
};

// ---------------------------------------------------------------- public
// On static hosts with no PHP (Vercel), /api is missing entirely. Public reads
// then fall back to the build-time snapshot in /data/clients.json. A real API
// answer, including its own JSON 404 for an unknown slug, is never replaced.
const apiMissing = (error) => error instanceof ApiError
  && (error.code === 'network' || (error.code === 'error' && (error.status === 404 || error.status >= 500)));

let snapshot = null;
const loadSnapshot = (signal) => {
  snapshot ??= fetch('/data/clients.json', { signal })
    .then((response) => {
      if (!response.ok) throw new Error();
      return response.json();
    })
    .catch(() => {
      snapshot = null;
      throw new ApiError('Clients could not be loaded right now.', { code: 'network' });
    });
  return snapshot;
};

const withFallback = (live, offline) => async (...args) => {
  try {
    return await live(...args);
  } catch (error) {
    if (!apiMissing(error)) throw error;
    return offline(await loadSnapshot(args.at(-1)), ...args);
  }
};

const csv = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean);

export const fetchTaxonomies = withFallback(
  (signal) => request('/taxonomies', { signal }).then((r) => r.data),
  (data) => data.taxonomies
);

// mirrors the SQL filter: name contains q, any selected industry, any selected solution
export const fetchClients = withFallback(
  (params = {}, signal) => request(`/clients${qs(params)}`, { signal }).then((r) => r),
  (data, params = {}) => {
    const q = String(params.q || '').trim().toLowerCase();
    const industries = csv(params.industries);
    const solutions = csv(params.solutions);
    const rows = data.clients.filter((client) =>
      (!q || client.name.toLowerCase().includes(q))
      && (!industries.length || client.industries.some((item) => industries.includes(item)))
      && (!solutions.length || client.solutions.some((item) => solutions.includes(item))));
    return { data: rows, meta: { total: rows.length, page: 1, perPage: rows.length } };
  }
);

export const fetchClient = withFallback(
  (slug, signal) => request(`/clients/${encodeURIComponent(slug)}`, { signal }).then((r) => r.data),
  (data, slug) => {
    const client = data.clients.find((item) => item.id === slug);
    if (!client) throw new ApiError('No client with that address.', { code: 'not_found', status: 404 });
    return client;
  }
);

export const fetchJobs = (signal) => request('/jobs', { signal }).then((r) => r.data);
export const fetchJob = (slug, signal) => request(`/jobs/${encodeURIComponent(slug)}`, { signal }).then((r) => r.data);
export const fetchPage = (slug, signal) => request(`/pages/${encodeURIComponent(slug)}`, { signal }).then((r) => r.data);
export const submitEnquiry = (payload) => request('/enquiries', { method: 'POST', body: payload }).then((r) => r.data);
export const submitApplication = (form) => request('/applications', { method: 'POST', form }).then((r) => r.data);

// ------------------------------------------------------------------ auth
export async function login(email, password) {
  const { data } = await request('/auth/login', { method: 'POST', body: { email, password } });
  setCsrfToken(data.csrfToken);
  return data.user;
}

export async function logout() {
  await request('/auth/logout', { method: 'POST' });
  setCsrfToken(null);
}

export async function fetchMe(signal) {
  const { data } = await request('/auth/me', { signal });
  setCsrfToken(data?.csrfToken ?? null);
  return data?.user ?? null;
}

export const changePassword = (currentPassword, newPassword) =>
  request('/auth/password', { method: 'POST', body: { currentPassword, newPassword } }).then((r) => r.data);

// ----------------------------------------------------------------- admin
export const adminStats = (signal) => request('/admin/stats', { signal }).then((r) => r.data);
export const adminClients = (signal) => request('/admin/clients', { signal }).then((r) => r.data);
export const adminClient = (slug, signal) => request(`/admin/clients/${encodeURIComponent(slug)}`, { signal }).then((r) => r.data);
export const createClient = (payload) => request('/admin/clients', { method: 'POST', body: payload }).then((r) => r.data);
export const updateClient = (slug, payload) => request(`/admin/clients/${encodeURIComponent(slug)}`, { method: 'PUT', body: payload }).then((r) => r.data);
export const removeClient = (slug) => request(`/admin/clients/${encodeURIComponent(slug)}`, { method: 'DELETE' });
export const setStatus = (slug, status) => request(`/admin/clients/${encodeURIComponent(slug)}/status`, { method: 'POST', body: { status } }).then((r) => r.data);

export async function uploadFile(file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await request('/admin/uploads', { method: 'POST', form });
  return data;    // { id, url, kind, name }
}

export const adminJobs = (signal) => request('/admin/jobs', { signal }).then((r) => r.data);
export const adminJob = (slug, signal) => request(`/admin/jobs/${encodeURIComponent(slug)}`, { signal }).then((r) => r.data);
export const createJob = (payload) => request('/admin/jobs', { method: 'POST', body: payload }).then((r) => r.data);
export const updateJob = (slug, payload) => request(`/admin/jobs/${encodeURIComponent(slug)}`, { method: 'PUT', body: payload }).then((r) => r.data);
export const removeJob = (slug) => request(`/admin/jobs/${encodeURIComponent(slug)}`, { method: 'DELETE' });

export const adminEnquiries = (params = {}, signal) => request(`/admin/enquiries${qs(params)}`, { signal }).then((r) => r.data);
export const updateEnquiry = (id, payload) => request(`/admin/enquiries/${id}`, { method: 'PATCH', body: payload }).then((r) => r.data);
export const removeEnquiry = (id) => request(`/admin/enquiries/${id}`, { method: 'DELETE' });

export const adminApplications = (params = {}, signal) => request(`/admin/applications${qs(params)}`, { signal }).then((r) => r.data);
export const updateApplication = (id, payload) => request(`/admin/applications/${id}`, { method: 'PATCH', body: payload }).then((r) => r.data);
export const removeApplication = (id) => request(`/admin/applications/${id}`, { method: 'DELETE' });
// a plain link: the session cookie authorises the download
export const resumeUrl = (id) => `${BASE}/admin/applications/${id}/resume`;

export const adminPages = (signal) => request('/admin/pages', { signal }).then((r) => r.data);
export const adminPage = (slug, signal) => request(`/admin/pages/${encodeURIComponent(slug)}`, { signal }).then((r) => r.data);
export const updatePage = (slug, payload) => request(`/admin/pages/${encodeURIComponent(slug)}`, { method: 'PUT', body: payload }).then((r) => r.data);
