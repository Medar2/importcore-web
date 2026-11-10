'use client'

import { UserRound } from 'lucide-react'
import { ADMIN_SECTIONS } from '@/features/admin/admin-sections'
import { AdminSectionCard } from '@/features/admin/components/admin-section-card'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'
import { can, displayName } from '@/features/auth/utils/permissions'

/** Accesos a la cuenta del usuario y, según permisos, a administración. */
export function AdminShortcuts() {
  const { user } = useCurrentUser()
  const sections = ADMIN_SECTIONS.filter((s) => can(user, s.permission))

  return (
    <section className="mt-6">
      <div className="mb-3">
        <h2 className="text-sm font-semibold">Cuenta y administración</h2>
        <p className="text-xs text-muted-foreground">
          {user ? `Sesión de ${displayName(user)}` : 'Tu perfil y la configuración del sistema.'}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AdminSectionCard
          label="Mi perfil"
          hint="Datos, roles, permisos y sesiones"
          icon={UserRound}
          href="/profile"
        />
        {sections.map((s) => (
          <AdminSectionCard key={s.href} label={s.label} hint={s.hint} icon={s.icon} href={s.href} />
        ))}
      </div>
    </section>
  )
}
