'use client'

import { useState } from 'react'
import Link from 'next/link'
import { KeyRound, Loader2 } from 'lucide-react'
import { fmtDateTime } from '@/features/auth/utils/format'
import { adminUsersService } from '../services/admin-users.service'
import type { AdminUser } from '../types'

interface AdminUserRowProps {
  user: AdminUser
  isSelf: boolean
  canEdit: boolean
  onChanged: (u: AdminUser) => void
}

export function AdminUserRow({ user, isSelf, canEdit, onChanged }: AdminUserRowProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const active = user.status === 'active'
  const name = `${user.person?.firstName ?? ''} ${user.person?.lastName ?? ''}`.trim() || user.username

  async function toggle() {
    const verb = active ? 'desactivar' : 'activar'
    if (!confirm(`¿Seguro que deseas ${verb} a ${name}?`)) return
    setBusy(true)
    setError(null)
    try {
      const updated = await adminUsersService.setActive(user.id, !active)
      onChanged({ ...user, status: updated.status })
    } catch (e) {
      setError(e instanceof Error ? e.message : `No se pudo ${verb}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">
            {name} {isSelf && <span className="text-xs font-normal text-muted-foreground">(tú)</span>}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            @{user.username}
            {user.person?.email ? ` · ${user.person.email}` : ''}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            active ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
          }`}
        >
          {active ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {user.isSuperAdmin && (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">Superadmin</span>
        )}
        {(user.roles ?? []).map((r) => (
          <span key={r.id} className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px]">
            {r.name}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        <p className="text-[11px] text-muted-foreground">Último acceso: {fmtDateTime(user.lastLoginAt)}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/users/${user.id}`}
            className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10"
          >
            <KeyRound className="size-3.5" />
            Gestionar acceso
          </Link>
          {canEdit && !isSelf && (
            <button
              type="button"
              onClick={toggle}
              disabled={busy}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition disabled:opacity-60 ${
                active
                  ? 'border-destructive/40 text-destructive hover:bg-destructive/10'
                  : 'border-success/40 text-success hover:bg-success/10'
              }`}
            >
              {busy && <Loader2 className="size-3.5 animate-spin" />}
              {active ? 'Desactivar' : 'Activar'}
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </li>
  )
}
