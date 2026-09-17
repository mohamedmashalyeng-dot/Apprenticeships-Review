export class ApiError extends Error {
  status: number;
  errors: unknown;

  constructor(status: number, message: string, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

// The API can live on a different domain than the SPA (e.g. Hostinger frontend + Render
// backend) — set at build time via VITE_API_BASE_URL. Empty string keeps requests
// relative, which is what the local Vite dev proxy and a same-domain deploy both need.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// Cached from the JSON body of GET /auth/csrf/ (see ensureCsrfCookie below). We can't
// fall back to reading the `csrftoken` cookie via document.cookie here — when the API is
// on a different domain than the SPA, that cookie belongs to the API's origin and is
// simply invisible to JavaScript running on the SPA's page, regardless of CORS settings.
let cachedCsrfToken: string | null = null;

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (UNSAFE_METHODS.has(method) && cachedCsrfToken) {
    headers.set("X-CSRFToken", cachedCsrfToken);
  }

  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  // A response body isn't guaranteed to be JSON — an unhandled server error (500) renders
  // Django's HTML debug/error page rather than the API's usual {message, errors} shape.
  // Falling through to JSON.parse in that case would throw a SyntaxError that masks the
  // real HTTP failure, so treat an unparsable body as "no structured error info" instead.
  let data: { message?: string; errors?: unknown } | null = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? `Request failed (${res.status}).`, data?.errors);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};

// For lookups where a 404 means "doesn't exist" rather than a real failure. Any other
// error (network drop, 500, auth lapse) is rethrown instead of silently becoming `null`.
export async function getOrNull<T>(path: string): Promise<T | null> {
  try {
    return await api.get<T>(path);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export function getApiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function ensureCsrfCookie(): Promise<void> {
  if (cachedCsrfToken) return;
  const data = await apiFetch<{ csrfToken: string }>("/auth/csrf/");
  cachedCsrfToken = data.csrfToken;
}
