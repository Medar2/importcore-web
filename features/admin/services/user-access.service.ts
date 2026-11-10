import { apiDelete, apiGet, apiPost } from '@/lib/api'

export interface UserAccess {
  userId: string
  isSuperAdmin: boolean
  roles: { id: string; name: string; description?: string | null }[]
  effectivePermissions: { code: string; source: string }[]
  directPermissions: { id: string; code: string }[]
}

export interface CatalogPermission {
  id: string
  code: string
  name: string
  module: string
}

export interface CatalogRole {
  id: string
  name: string
  description?: string | null
}

export const userAccessService = {
  get: (userId: string) => apiGet<UserAccess>(`/users/${userId}/access`),
  catalogPermissions: () => apiGet<CatalogPermission[]>('/permissions'),
  catalogRoles: () => apiGet<CatalogRole[]>('/roles'),
  assignRole: (userId: string, roleId: string) => apiPost(`/users/${userId}/roles/${roleId}`),
  removeRole: (userId: string, roleId: string) => apiDelete(`/users/${userId}/roles/${roleId}`),
  assignDirect: (userId: string, permissionCode: string) =>
    apiPost(`/users/${userId}/access/permissions`, { permissionCode }),
  revokeDirect: (userId: string, userPermissionId: string) =>
    apiDelete(`/users/${userId}/access/permissions/${userPermissionId}`),
}
