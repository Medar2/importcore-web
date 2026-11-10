import type { CurrentUser } from '../types'

export const PERM = {
  USERS_VIEW: 'ADMINISTRACION.USUARIOS.VER',
  USERS_EDIT: 'ADMINISTRACION.USUARIOS.EDITAR',
  ROLES_VIEW: 'ADMINISTRACION.ROLES.VER',
  ROLES_CREATE: 'ADMINISTRACION.ROLES.CREAR',
  ROLES_EDIT: 'ADMINISTRACION.ROLES.EDITAR',
  ROLES_DELETE: 'ADMINISTRACION.ROLES.ELIMINAR',
  USERS_CREATE: 'ADMINISTRACION.USUARIOS.CREAR',
  PERMISSIONS_VIEW: 'ADMINISTRACION.PERMISOS.VER',
  PERMISSIONS_ASSIGN: 'ADMINISTRACION.PERMISOS.ASIGNAR',
  PERMISSIONS_REVOKE: 'ADMINISTRACION.PERMISOS.REVOCAR',
  AUDIT_VIEW: 'ADMINISTRACION.AUDITORIA.VER',
  SETTINGS_VIEW: 'CONFIGURACION.SISTEMA.VER',
  SETTINGS_EDIT: 'CONFIGURACION.SISTEMA.EDITAR',
} as const

/** Igual que el backend: el superadmin pasa todo; acepta comodines `X.*` y `*`. */
export function can(user: CurrentUser | null, code: string): boolean {
  if (!user) return false
  if (user.profile.isSuperAdmin) return true
  return user.permissions.some(
    (p) => p === code || p === '*' || (p.endsWith('.*') && code.startsWith(p.slice(0, -1))),
  )
}

export function canAny(user: CurrentUser | null, codes: string[]): boolean {
  return codes.some((c) => can(user, c))
}

export const ADMIN_PERMS = [
  PERM.USERS_VIEW,
  PERM.ROLES_VIEW,
  PERM.PERMISSIONS_VIEW,
  PERM.AUDIT_VIEW,
  PERM.SETTINGS_VIEW,
]

export function displayName(user: CurrentUser | null): string {
  if (!user) return ''
  const { firstName, lastName, username } = user.profile
  return `${firstName} ${lastName}`.trim() || username
}

export function initials(user: CurrentUser | null): string {
  const name = displayName(user)
  const parts = name.split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
}
