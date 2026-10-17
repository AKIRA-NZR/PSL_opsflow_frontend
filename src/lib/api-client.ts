import type { ProblemDetail } from '../types/opsflow';

/**
 * Custom Error wrapper for RFC 9457 Problem Details (`application/problem+json`).
 */
export class ApiProblemError extends Error {
  public readonly problem: ProblemDetail;

  constructor(problem: ProblemDetail) {
    super(problem.detail || problem.title);
    this.name = 'ApiProblemError';
    this.problem = problem;
  }
}

/**
 * In-memory Access Token store (Short-lived JWT, 15 min) + Single-Flight Refresh Mutex.
 * Protects against Threat T-04 (Refresh Token Reuse Detection false positives on concurrent 401s).
 */
let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Executes a single-flight token rotation against `POST /api/v1/auth/refresh`.
 * Even if 5 parallel requests receive 401 simultaneously, only 1 HTTP call is made.
 */
async function refreshAccessTokenSingleFlight(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Sends HttpOnly Refresh Token cookie
      headers: {
        Accept: 'application/json, application/problem+json',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          setAccessToken(null);
          return null;
        }
        const data = (await res.json()) as { accessToken: string };
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

/**
 * Standard HTTP Client for OpsFlow Backend (`/api/v1`) with:
 * - Automatic Bearer JWT injection
 * - Single-Flight 401 Refresh Token Rotation Mutex (T-04 mitigation)
 * - RFC 9457 `application/problem+json` error parsing
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  retried = false
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json, application/problem+json');
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`/api/v1${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401 && !retried && !path.startsWith('/auth/')) {
    const newToken = await refreshAccessTokenSingleFlight();
    if (newToken) {
      return apiFetch<T>(path, init, true);
    }
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/problem+json') || contentType.includes('application/json')) {
      const problem = (await response.json()) as ProblemDetail;
      throw new ApiProblemError(problem);
    }

    throw new ApiProblemError({
      type: 'https://opsflow.dev/problems/unexpected-error',
      title: response.statusText || 'Unexpected HTTP Error',
      status: response.status,
      detail: `HTTP ${response.status} returned from ${path}`,
      instance: `/api/v1${path}`,
      timestamp: new Date().toISOString(),
      traceId: crypto.randomUUID().slice(0, 8),
      errorCode: `HTTP_${response.status}`,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
