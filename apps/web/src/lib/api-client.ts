import { API_BASE } from "@/lib/constants";
import { useAuthStore } from "@/store/useAuthStore";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

let refreshPromise: Promise<string | null> | null = null;

/**
 * Calls /api/auth/refresh with the stored refresh token and rotates both
 * tokens in the auth store on success. Concurrent 401s share one in-flight
 * refresh instead of each racing their own.
 */
function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const currentRefreshToken = useAuthStore.getState().refreshToken;
      if (!currentRefreshToken) return null;

      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: currentRefreshToken }),
        });
        if (!res.ok) return null;

        const data = await res.json();
        if (typeof data.accessToken !== "string" || typeof data.refreshToken !== "string") {
          return null;
        }

        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        return data.accessToken as string;
      } catch {
        return null;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

interface ApiFetchOptions extends RequestInit {
  /** Skip the 401 -> refresh -> retry flow (used internally to avoid recursion). */
  skipAuthRetry?: boolean;
}

/**
 * fetch() wrapper that attaches the current access token and transparently
 * refreshes + retries once on a 401. Callers never need to read or pass
 * tokens themselves — the store is the single source of truth.
 */
export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const { skipAuthRetry, headers, ...rest } = options;

  const request = (accessToken: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
    });

  const res = await request(useAuthStore.getState().token);

  if (res.status !== 401 || skipAuthRetry) {
    return res;
  }

  const newToken = await refreshAccessToken();
  if (!newToken) {
    // Refresh token is invalid/expired too — the session is over.
    useAuthStore.getState().logout();
    return res;
  }

  return request(newToken);
}

/** Parses a JSON API response, throwing ApiError on a non-2xx status. */
export async function apiFetchJson<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const res = await apiFetch(path, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      typeof body?.error === "string" ? body.error : `Request failed (${res.status})`,
      res.status,
      body
    );
  }
  return body as T;
}

/** Best-effort server-side session revocation, then always clears local auth state. */
export async function signOut(): Promise<void> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (refreshToken) {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Best-effort — clear local state regardless of network failure.
    }
  }
  useAuthStore.getState().logout();
}
