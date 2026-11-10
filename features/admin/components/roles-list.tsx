'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Loader2 } from 'lucide-react'
import { rolesAdminService, type AdminRoleDetail } from '../services/roles-admin.service'

export function RolesList({ version = 0 }: { version?: number }) {
  const [roles, setRoles] = useState<AdminRoleDetail[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    rolesAdminService.list().then(setRoles).catch((e: Error) => setError(e.message))
  }, [version])

  if (error) return <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
  if (!roles) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando roles…
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {roles.map((r) => (
        <li key={r.id}>
          <Link
            href={`/admin/roles/${r.id}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{r.name}</span>
              {r.description && <span className="block text-xs text-muted-foreground">{r.description}</span>}
              <span className="mt-1 block text-[11px] text-muted-foreground">
                {r.permissions?.length ?? 0} permiso(s)
                {r.isSystemRole && ' · rol de sistema'}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
