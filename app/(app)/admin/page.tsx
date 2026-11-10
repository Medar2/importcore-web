'use client'

import { ADMIN_SECTIONS } from '@/features/admin/admin-sections'
import { AdminSectionCard } from '@/features/admin/components/admin-section-card'
import { PermissionGate } from '@/features/auth/components/permission-gate'
import { ADMIN_PERMS, can } from '@/features/auth/utils/permissions'

export default function AdminPage() {
  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Administración</h1>
        <p className="text-xs text-muted-foreground">Seguridad y configuración dentro de ImportCore (sin apps externas).</p>
      </header>
      <PermissionGate anyOf={ADMIN_PERMS}>
        {(user) => {
          const sections = ADMIN_SECTIONS.filter((s) => can(user, s.permission))
          return (
            <div className="mx-auto max-w-3xl p-4">
              <section className="grid gap-3 sm:grid-cols-2">
                {sections.map((s) => (
                  <AdminSectionCard key={s.href} label={s.label} hint={s.hint} icon={s.icon} href={s.href} />
                ))}
              </section>
            </div>
          )
        }}
      </PermissionGate>
    </main>
  )
}
