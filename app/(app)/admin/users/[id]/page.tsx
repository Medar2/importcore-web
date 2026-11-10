'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { UserAccessPanel } from '@/features/admin/components/user-access-panel'
import { PermissionGate } from '@/features/auth/components/permission-gate'
import { PERM } from '@/features/auth/utils/permissions'

export default function AdminUserAccessPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : ''

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <Link href="/admin/users" className="mb-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" />
          Usuarios
        </Link>
        <h1 className="font-bold">Gestionar acceso</h1>
      </header>
      <div className="mx-auto max-w-3xl p-4">
        <PermissionGate anyOf={[PERM.USERS_VIEW]}>
          {(me) => (id ? <UserAccessPanel userId={id} me={me} /> : <p className="text-sm text-destructive">Usuario no válido</p>)}
        </PermissionGate>
      </div>
    </main>
  )
}
