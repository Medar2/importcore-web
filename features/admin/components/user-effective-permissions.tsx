'use client'

import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { UserAccess } from '../services/user-access.service'

function groupByPrefix(codes: { code: string; source: string }[]) {
  const groups = new Map<string, { code: string; source: string }[]>()
  for (const p of codes) {
    const parts = p.code.split('.')
    const key = parts.length > 2 ? parts.slice(0, 2).join('.') : parts[0]
    groups.set(key, [...(groups.get(key) ?? []), p])
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))
}

export function UserEffectivePermissions({ access }: { access: UserAccess }) {
  const [open, setOpen] = useState<string | null>(null)
  const groups = useMemo(() => groupByPrefix(access.effectivePermissions), [access.effectivePermissions])

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Permisos efectivos</h2>
      <p className="mb-2 text-xs text-muted-foreground">
        Unión de roles + directos + delegados ({access.effectivePermissions.length}).
      </p>
      {access.isSuperAdmin && (
        <p className="mb-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">Superadmin: acceso total.</p>
      )}
      <ul className="divide-y divide-border">
        {groups.map(([group, items]) => (
          <li key={group}>
            <button
              type="button"
              onClick={() => setOpen(open === group ? null : group)}
              className="flex w-full items-center justify-between py-2 text-left text-sm"
            >
              <span className="font-medium">{group}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {items.length}
                <ChevronDown className={`size-4 transition ${open === group ? 'rotate-180' : ''}`} />
              </span>
            </button>
            {open === group && (
              <div className="flex flex-wrap gap-1.5 pb-3">
                {items.map((p) => (
                  <span key={p.code} className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px]" title={p.source}>
                    {p.code.split('.').slice(2).join('.') || p.code}
                    <span className="ml-1 text-muted-foreground">({p.source})</span>
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
