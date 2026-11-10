import { getRefreshToken } from '@/lib/api'

/** Id de la sesión de este dispositivo, leído del payload del refresh token. */
export function currentSessionId(): string | null {
  const token = getRefreshToken()
  const payload = token?.split('.')[1]
  if (!payload) return null
  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return (JSON.parse(json) as { sessionId?: string }).sessionId ?? null
  } catch {
    return null
  }
}
