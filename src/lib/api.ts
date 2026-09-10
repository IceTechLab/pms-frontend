/**
 * Minimal REST client for the PharmaCare Express API.
 *
 * The API base is configurable so the SPA can be hosted separately from the
 * backend (e.g. Vercel frontend + Render API):
 *   - In development Vite proxies "/api" to the Express server, so the default
 *     (empty base) keeps requests same-origin.
 *   - In production set VITE_API_URL (e.g. https://pms-backend.onrender.com)
 *     at build time; Vite inlines it into the bundle.
 */

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
const API_ROOT = `${API_BASE}/api`;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_ROOT}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      (body && typeof body === 'object' && 'message' in body
        ? String((body as { message?: unknown }).message)
        : undefined) || `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
