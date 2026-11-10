'use client'

import { RolesPagePanel } from '@/features/admin/components/roles-page-panel'
import { PermissionGate } from '@/features/auth/components/permission-gate'
import { PERM } from '@/features/auth/utils/permissions'

export default function AdminRolesPage() {
  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Roles</h1>
        <p className="text-xs text-muted-foreground">
          Crea roles, asígna permisos por matriz y luego asígnalos a usuarios en Usuarios → Gestionar acceso.
        </p>
      </header>
      <PermissionGate anyOf={[PERM.ROLES_VIEW]}>
        {(me) => (
          <div className="mx-auto max-w-3xl p-4">
            <RolesPagePanel me={me} />
          </div>
        )}
      </PermissionGate>
    </main>
  )
}
