const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8001/api';
const TOKEN_KEY = 'importcore_token';
const REFRESH_KEY = 'importcore_refresh_token';

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user?: { username?: string; email?: string; roles?: string[] };
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, refreshToken?: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

let refreshInFlight: Promise<string | null> | null = null;

/** Un solo refresh compartido si varias pantallas reciben 401 a la vez. */
function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.resolve(null);

  refreshInFlight = fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) return null;
      const data = (await res.json()) as { accessToken?: string };
      if (!data.accessToken) return null;
      setToken(data.accessToken);
      return data.accessToken;
    })
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

function redirectToLogin(): void {
  clearToken();
  if (typeof window === 'undefined') return;
  if (window.location.pathname.startsWith('/login')) return;
  window.location.assign('/login');
}

async function authorizedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const send = (token: string | null) => {
    const headers = new Headers(init.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(`${BASE_URL}${path}`, { ...init, headers, cache: 'no-store' });
  };

  const res = await send(getToken());
  if (res.status !== 401 || path.startsWith('/auth/')) return res;

  const next = await refreshAccessToken();
  if (!next) {
    redirectToLogin();
    return res;
  }
  return send(next);
}

/** Cierra en el servidor solo la sesión de este dispositivo (best effort). */
export async function logoutDevice(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return;
  await fetch(`${BASE_URL}/auth/logout/device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => undefined);
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message ?? 'Credenciales inválidas';
    throw new Error(msg);
  }
  return data as LoginResponse;
}

export async function requestPasswordReset(
  email: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message ?? 'No se pudo enviar el correo de recuperación';
    throw new Error(msg);
  }
  return data as { success: boolean; message: string };
}

export async function resetPasswordConfirm(
  token: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message ?? 'No se pudo restablecer la contraseña';
    throw new Error(msg);
  }
  return data as { success: boolean; message: string };
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await authorizedFetch(path);
  if (!res.ok) throw new Error(`API ${res.status} en ${path}`);
  return res.json() as Promise<T>;
}

async function apiSend<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await authorizedFetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray((data as { message?: string[] }).message)
      ? (data as { message: string[] }).message.join(', ')
      : (data as { message?: string }).message ?? `Error ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const apiPost = <T>(path: string, body?: unknown) =>
  apiSend<T>('POST', path, body);
export const apiPut = <T>(path: string, body?: unknown) =>
  apiSend<T>('PUT', path, body);
export const apiPatch = <T>(path: string, body?: unknown) =>
  apiSend<T>('PATCH', path, body);
export const apiDelete = (path: string) => apiSend<void>('DELETE', path);

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await authorizedFetch(path, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray((data as { message?: string[] }).message)
      ? (data as { message: string[] }).message.join(', ')
      : (data as { message?: string }).message ?? `Error ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export function pdfUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

export async function downloadFile(path: string, filename: string): Promise<void> {
  const res = await authorizedFetch(path);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? `Error ${res.status}`);
  }
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadPdf(path: string, filename: string): Promise<void> {
  const res = await authorizedFetch(path);
  if (!res.ok) throw new Error(`No se pudo generar el PDF (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
