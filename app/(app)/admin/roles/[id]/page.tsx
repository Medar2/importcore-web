'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { RolePermissionMatrix } from '@/features/admin/components/role-permission-matrix'
import { PermissionGate } from '@/features/auth/components/permission-gate'
import { PERM } from '@/features/auth/utils/permissions'

export default function AdminRoleDetailPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : ''

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <Link href="/admin/roles" className="mb-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" />
          Roles
        </Link>
        <h1 className="font-bold">Matriz de permisos</h1>
      </header>
      <PermissionGate anyOf={[PERM.ROLES_VIEW]}>
        {(me) => (
          <div className="mx-auto max-w-3xl p-4">
            {id ? <RolePermissionMatrix roleId={id} me={me} /> : <p className="text-sm text-destructive">Rol no válido</p>}
          </div>
        )}
      </PermissionGate>
    </main>
  )
}
