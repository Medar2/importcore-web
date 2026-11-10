'use client'

import { PermissionsCatalog } from '@/features/admin/components/permissions-catalog'
import { PermissionGate } from '@/features/auth/components/permission-gate'
import { PERM } from '@/features/auth/utils/permissions'

export default function AdminPermissionsPage() {
  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Permisos</h1>
        <p className="text-xs text-muted-foreground">Catálogo completo registrado en importcore-api.</p>
      </header>
      <PermissionGate anyOf={[PERM.PERMISSIONS_VIEW]}>
        {() => (
          <div className="mx-auto max-w-3xl p-4">
            <PermissionsCatalog />
          </div>
        )}
      </PermissionGate>
    </main>
  )
}
