'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, KeyRound } from 'lucide-react'
import type { CurrentUser } from '../types'

/** Agrupa por las dos primeras partes del código: `IMPORTCORE.ORDERS.READ` → `IMPORTCORE.ORDERS`. */
function groupPermissions(codes: string[]): [string, string[]][] {
  const groups = new Map<string, string[]>()
  for (const code of [...codes].sort()) {
    const parts = code.split('.')
    const key = parts.length > 2 ? parts.slice(0, 2).join('.') : parts[0]
    groups.set(key, [...(groups.get(key) ?? []), parts.slice(key.split('.').length).join('.') || code])
  }
  return [...groups.entries()]
}

export function PermissionsList({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState<string | null>(null)
  const groups = useMemo(() => groupPermissions(user.permissions), [user.permissions])

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <KeyRound className="size-4 text-muted-foreground" /> Permisos
        </h2>
        <span className="text-xs text-muted-foreground">{user.permissions.length} en total</span>
      </div>
      {user.profile.isSuperAdmin && (
        <p className="mb-3 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
          Como superadministrador tienes acceso a todo, aunque no aparezca en la lista.
        </p>
      )}
      {groups.length === 0 && <p className="text-sm text-muted-foreground">Sin permisos asignados.</p>}
      <ul className="divide-y divide-border">
        {groups.map(([group, actions]) => (
          <li key={group}>
            <button
              type="button"
              onClick={() => setOpen(open === group ? null : group)}
              aria-expanded={open === group}
              className="flex w-full items-center justify-between gap-2 py-2.5 text-left text-sm"
            >
              <span className="truncate font-medium">{group}</span>
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                {actions.length}
                <ChevronDown className={`size-4 transition ${open === group ? 'rotate-180' : ''}`} />
              </span>
            </button>
            {open === group && (
              <div className="flex flex-wrap gap-1.5 pb-3">
                {actions.map((a) => (
                  <span key={a} className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[11px]">
                    {a}
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
