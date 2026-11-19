import type { CatalogPermission } from '../services/user-access.service'

/**
 * Agrupa permisos para la UI. IMPORTCORE concentra varios recursos de negocio
 * bajo un solo módulo, así que se subdivide por `resource` (QUOTES, ORDERS…).
 */
export function permissionGroup(p: CatalogPermission): string {
  if (p.module === 'IMPORTCORE' && p.resource) {
    return `IMPORTCORE · ${p.resource}`
  }
  return p.module
}
