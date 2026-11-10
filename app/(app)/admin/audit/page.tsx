'use client'

import { AuditLogList } from '@/features/admin/components/audit-log-list'
import { PermissionGate } from '@/features/auth/components/permission-gate'
import { PERM } from '@/features/auth/utils/permissions'

export default function AdminAuditPage() {
  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Auditoría</h1>
        <p className="text-xs text-muted-foreground">Accesos, cambios de roles y eventos de seguridad.</p>
      </header>
      <PermissionGate anyOf={[PERM.AUDIT_VIEW]}>
        {() => (
          <div className="mx-auto max-w-3xl p-4">
            <AuditLogList />
          </div>
        )}
      </PermissionGate>
    </main>
  )
}
