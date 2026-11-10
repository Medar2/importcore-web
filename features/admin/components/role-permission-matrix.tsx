'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { PERM, can } from '@/features/auth/utils/permissions'
import type { CurrentUser } from '@/features/auth/types'
import { rolesAdminService } from '../services/roles-admin.service'
import { userAccessService, type CatalogPermission } from '../services/user-access.service'

interface RolePermissionMatrixProps {
  roleId: string
  me: CurrentUser
}

export function RolePermissionMatrix({ roleId, me }: RolePermissionMatrixProps) {
  const [roleName, setRoleName] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [catalog, setCatalog] = useState<CatalogPermission[]>([])
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const canEdit = can(me, PERM.ROLES_EDIT) || can(me, PERM.PERMISSIONS_ASSIGN) || can(me, PERM.ROLES_CREATE)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [role, perms] = await Promise.all([
          rolesAdminService.get(roleId),
          userAccessService.catalogPermissions(),
        ])
        if (cancelled) return
        setRoleName(role.name)
        setSelected(new Set((role.permissions ?? []).map((p) => p.id)))
        setCatalog(perms)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [roleId])

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase()
    const filtered = catalog.filter(
      (p) => !term || p.code.toLowerCase().includes(term) || p.name.toLowerCase().includes(term),
    )
    const map = new Map<string, CatalogPermission[]>()
    for (const p of filtered) {
      map.set(p.module, [...(map.get(p.module) ?? []), p])
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [catalog, q])

  function toggle(id: string) {
    if (!canEdit) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setSaved(false)
  }

  async function save() {
    setBusy(true)
    setError(null)
    try {
      await rolesAdminService.setPermissions(roleId, [...selected])
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar')
    } finally {
      setBusy(false)
    }
  }

  if (!roleName && !error) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando matriz…
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Rol <span className="font-semibold text-foreground">{roleName}</span>
        {!canEdit && ' · solo lectura'}
      </p>
      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      {saved && <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">Permisos actualizados.</p>}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filtrar permisos"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
      />
      <div className="max-h-[50vh] space-y-3 overflow-y-auto rounded-xl border border-border p-3">
        {groups.map(([mod, items]) => (
          <div key={mod}>
            <p className="mb-1 text-xs font-semibold text-muted-foreground">{mod}</p>
            <ul className="space-y-1">
              {items.map((p) => (
                <li key={p.id}>
                  <label className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50">
                    <input
                      type="checkbox"
                      disabled={!canEdit}
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block font-mono text-[11px]">{p.code}</span>
                      <span className="block text-xs text-muted-foreground">{p.name}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {canEdit && (
        <button
          type="button"
          disabled={busy}
          onClick={save}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Guardar matriz
        </button>
      )}
    </div>
  )
}
