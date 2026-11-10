'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { adminUsersService } from '@/features/admin/services/admin-users.service'
import { AdminUserRow } from '@/features/admin/components/admin-user-row'
import type { AdminUser } from '@/features/admin/types'
import { PermissionGate } from '@/features/auth/components/permission-gate'
import { PERM, can } from '@/features/auth/utils/permissions'
import type { CurrentUser } from '@/features/auth/types'
function UsersList({ me }: { me: CurrentUser }) {
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    adminUsersService.list().then(setUsers).catch((e: Error) => setError(e.message))
  }, [])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!users || !term) return users ?? []
    return users.filter((u) =>
      [u.username, u.person?.firstName, u.person?.lastName, u.person?.email, ...(u.roles ?? []).map((r) => r.name)]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(term)),
    )
  }, [users, q])

  const canEdit = can(me, PERM.USERS_EDIT)
  const replace = (u: AdminUser) => setUsers((list) => list?.map((x) => (x.id === u.id ? u : x)) ?? null)

  return (
    <div className="mx-auto max-w-3xl space-y-3 p-4">
      <label className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, usuario, email o rol"
          className="w-full bg-transparent text-sm outline-none"
        />
      </label>
      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      {!users && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando…
        </p>
      )}
      {users && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} de {users.length} usuario(s)
          {!canEdit && ' · solo lectura'}
        </p>
      )}
      <ul className="space-y-2">
        {filtered.map((u) => (
          <AdminUserRow key={u.id} user={u} isSelf={u.id === me.profile.id} canEdit={canEdit} onChanged={replace} />
        ))}
      </ul>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Usuarios</h1>
      </header>
      <PermissionGate anyOf={[PERM.USERS_VIEW]}>{(me) => <UsersList me={me} />}</PermissionGate>
    </main>
  )
}
