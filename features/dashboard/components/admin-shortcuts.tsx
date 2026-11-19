'use client'

import { UserRound } from 'lucide-react'
import { ADMIN_SECTIONS } from '@/features/admin/admin-sections'
import { AdminSectionCard } from '@/features/admin/components/admin-section-card'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'
import { can, displayName } from '@/features/auth/utils/permissions'
import { SectionHeading } from './brand'

/** Accesos a la cuenta del usuario y, según permisos, a administración. */
export function AdminShortcuts() {
  const { user } = useCurrentUser()
  const sections = ADMIN_SECTIONS.filter((s) => can(user, s.permission))

  const cards = [
    {
      label: 'Mi perfil',
      hint: 'Datos, roles, permisos y sesiones',
      icon: UserRound,
      href: '/profile',
    },
    ...sections,
  ]

  return (
    <section className="mt-8">
      <SectionHeading
        kicker="Acceso"
        title="Cuenta"
        hint={user ? `Sesión de ${displayName(user)}` : 'Perfil y configuración del sistema.'}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <AdminSectionCard
            key={card.href}
            label={card.label}
            hint={card.hint}
            icon={card.icon}
            href={card.href}
            tone={index % 2 === 0 ? 'blue' : 'red'}
          />
        ))}
      </div>
    </section>
  )
}
