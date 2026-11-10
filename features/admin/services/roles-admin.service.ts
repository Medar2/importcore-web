import { apiGet, apiPost, apiPut } from '@/lib/api'

export interface AdminRoleDetail {
  id: string
  name: string
  description?: string | null
  isSystemRole?: boolean
  permissions?: { id: string; code: string; name: string; module: string }[]
}

export const rolesAdminService = {
  list: () => apiGet<AdminRoleDetail[]>('/roles'),
  get: (id: string) => apiGet<AdminRoleDetail>(`/roles/${id}`),
  create: (body: { name: string; description?: string; permissionIds?: string[] }) =>
    apiPost<AdminRoleDetail>('/roles', body),
  setPermissions: (id: string, permissionIds: string[]) =>
    apiPut<AdminRoleDetail>(`/roles/${id}/permissions`, { permissionIds }),
}
