'use client'

import { useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import type { CatalogRole, UserAccess } from '../services/user-access.service'
import { userAccessService } from '../services/user-access.service'

interface UserRolesEditorProps {
  userId: string
  access: UserAccess
  catalog: CatalogRole[]
  canEdit: boolean
  onUpdated: (access: UserAccess) => void
  onError: (msg: string) => void
}

export function UserRolesEditor({ userId, access, catalog, canEdit, onUpdated, onError }: UserRolesEditorProps) {
  const [roleId, setRoleId] = useState('')
  const [busy, setBusy] = useState(false)

  const assigned = new Set(access.roles.map((r) => r.id))
  const available = catalog.filter((r) => !assigned.has(r.id))

  async function add() {
    if (!roleId) return
    setBusy(true)
    onError('')
    try {
      await userAccessService.assignRole(userId, roleId)
      const next = await userAccessService.get(userId)
      onUpdated(next)
      setRoleId('')
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo asignar el rol')
    } finally {
      setBusy(false)
    }
  }

  async function remove(roleId: string, name: string) {
    if (!confirm(`¿Quitar el rol "${name}"?`)) return
    setBusy(true)
    onError('')
    try {
      await userAccessService.removeRole(userId, roleId)
      onUpdated(await userAccessService.get(userId))
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo quitar el rol')
    } finally {
      setBusy(false)
    }
  }

  if (access.isSuperAdmin) {
    return (
      <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
        Superadministrador: tiene todos los permisos; los roles son solo informativos.
      </p>
    )
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Roles asignados</h2>
      <p className="text-xs text-muted-foreground">
        Los permisos del usuario se heredan principalmente de sus roles (Operador, Contador, etc.).
      </p>
      <ul className="flex flex-wrap gap-2">
        {access.roles.length === 0 && <li className="text-sm text-muted-foreground">Sin roles</li>}
        {access.roles.map((r) => (
          <li key={r.id} className="flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs">
            {r.name}
            {canEdit && (
              <button type="button" disabled={busy} onClick={() => remove(r.id, r.name)} aria-label={`Quitar ${r.name}`}>
                <X className="size-3.5 text-muted-foreground" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {canEdit && available.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Agregar rol…</option>
            {available.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button type="button" disabled={busy || !roleId} onClick={add} className="flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Asignar
          </button>
        </div>
      )}
    </section>
  )
}
