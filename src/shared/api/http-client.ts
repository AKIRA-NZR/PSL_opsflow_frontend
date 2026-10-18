let accessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function setAuthAccessToken(token: string | null): void {
  accessToken = token;
}

async function rotateTokenSingleFlight(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const body = (await res.json()) as { accessToken: string };
        accessToken = body.accessToken;
        return accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export async function httpRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const res = await fetch(`/api/v1${endpoint}`, { ...options, headers });

  if (res.status === 401 && !isRetry && !endpoint.startsWith('/auth/')) {
    const rotated = await rotateTokenSingleFlight();
    if (rotated) {
      return httpRequest<T>(endpoint, options, true);
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || errorBody.message || 'Erro ao comunicar com o servidor.');
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
