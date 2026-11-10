import { apiGet, apiPatch } from '@/lib/api'
import type { AdminUser } from '../types'

export const adminUsersService = {
  list: () => apiGet<AdminUser[]>('/users'),
  get: (id: string) => apiGet<AdminUser>(`/users/${id}`),
  setActive: (id: string, active: boolean) => apiPatch<AdminUser>(`/users/${id}/status`, { active }),
}
