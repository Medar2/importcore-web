'use client'

import { useMemo, useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import type { CatalogPermission, UserAccess } from '../services/user-access.service'
import { userAccessService } from '../services/user-access.service'

interface UserDirectPermissionsProps {
  userId: string
  access: UserAccess
  catalog: CatalogPermission[]
  canAssign: boolean
  canRevoke: boolean
  onUpdated: (access: UserAccess) => void
  onError: (msg: string) => void
}

export function UserDirectPermissions({
  userId,
  access,
  catalog,
  canAssign,
  canRevoke,
  onUpdated,
  onError,
}: UserDirectPermissionsProps) {
  const [code, setCode] = useState('')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)

  const directCodes = new Set(access.directPermissions.map((p) => p.code))
  const options = useMemo(() => {
    const term = q.trim().toLowerCase()
    return catalog.filter(
      (p) =>
        !directCodes.has(p.code) &&
        (!term || p.code.toLowerCase().includes(term) || p.name.toLowerCase().includes(term)),
    )
  }, [catalog, access.directPermissions, q])

  async function assign() {
    if (!code) return
    setBusy(true)
    onError('')
    try {
      await userAccessService.assignDirect(userId, code)
      onUpdated(await userAccessService.get(userId))
      setCode('')
      setQ('')
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo asignar')
    } finally {
      setBusy(false)
    }
  }

  async function revoke(id: string, permCode: string) {
    if (!confirm(`¿Revocar el permiso directo ${permCode}?`)) return
    setBusy(true)
    onError('')
    try {
      await userAccessService.revokeDirect(userId, id)
      onUpdated(await userAccessService.get(userId))
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo revocar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Permisos directos</h2>
      <p className="text-xs text-muted-foreground">
        Excepciones puntuales además de los roles. Use con cuidado: prevalecen sobre la matriz habitual.
      </p>
      <ul className="divide-y divide-border">
        {access.directPermissions.length === 0 && (
          <li className="py-2 text-sm text-muted-foreground">Ningún permiso directo</li>
        )}
        {access.directPermissions.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-2 py-2 text-sm">
            <span className="font-mono text-xs">{p.code}</span>
            {canRevoke && (
              <button type="button" disabled={busy} onClick={() => revoke(p.id, p.code)} className="text-destructive">
                <Trash2 className="size-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {canAssign && !access.isSuperAdmin && (
        <div className="space-y-2 border-t border-border pt-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar permiso por código o nombre"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <select value={code} onChange={(e) => setCode(e.target.value)} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option value="">Seleccionar…</option>
              {options.slice(0, 80).map((p) => (
                <option key={p.id} value={p.code}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
            <button type="button" disabled={busy || !code} onClick={assign} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {busy ? <Loader2 className="size-4 animate-spin" /> : 'Asignar directo'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
