'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { userAccessService, type CatalogPermission } from '../services/user-access.service'

export function PermissionsCatalog() {
  const [perms, setPerms] = useState<CatalogPermission[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    userAccessService.catalogPermissions().then(setPerms).catch((e: Error) => setError(e.message))
  }, [])

  const groups = useMemo(() => {
    if (!perms) return []
    const term = q.trim().toLowerCase()
    const filtered = perms.filter(
      (p) => !term || p.code.toLowerCase().includes(term) || p.name.toLowerCase().includes(term),
    )
    const map = new Map<string, CatalogPermission[]>()
    for (const p of filtered) {
      map.set(p.module, [...(map.get(p.module) ?? []), p])
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [perms, q])

  if (error) return <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
  if (!perms) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando catálogo…
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por código o nombre"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
      />
      <p className="text-xs text-muted-foreground">{perms.length} permiso(s) · solo lectura</p>
      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {groups.map(([mod, items]) => (
          <li key={mod}>
            <button
              type="button"
              onClick={() => setOpen(open === mod ? null : mod)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm"
            >
              <span className="font-medium">{mod}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {items.length}
                <ChevronDown className={`size-4 transition ${open === mod ? 'rotate-180' : ''}`} />
              </span>
            </button>
            {open === mod && (
              <ul className="space-y-2 border-t border-border px-4 pb-3 pt-2">
                {items.map((p) => (
                  <li key={p.id} className="text-xs">
                    <span className="font-mono text-[11px]">{p.code}</span>
                    <span className="ml-2 text-muted-foreground">{p.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
