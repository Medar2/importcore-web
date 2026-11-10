import { apiDelete, apiGet, apiPost } from '@/lib/api'
import type { ActiveSession, UserPermission, UserProfile } from '../types'

export const profileService = {
  me: () => apiGet<UserProfile>('/auth/me'),
  permissions: () =>
    apiGet<{ permissions: UserPermission[] }>('/rbac/permissions').then((r) => r.permissions),
  sessions: () => apiGet<ActiveSession[]>('/auth/sessions'),
  closeSession: (id: string) => apiDelete(`/auth/sessions/${id}`),
  /** Cierra todas las sesiones del usuario en el servidor. */
  logoutEverywhere: () => apiPost<void>('/auth/logout'),
}
