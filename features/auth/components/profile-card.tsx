import { BadgeCheck, Building2, Mail, Phone, ShieldAlert, ShieldCheck } from 'lucide-react'
import type { CurrentUser } from '../types'
import { displayName, initials } from '../utils/permissions'
import { fmtDateTime as fmtDate } from '../utils/format'

function Row({ icon: Icon, children }: { icon: typeof Mail; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-sm">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 truncate">{children}</span>
    </p>
  )
}

export function ProfileCard({ user }: { user: CurrentUser }) {
  const p = user.profile
  const active = p.status === 'active'

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
          {initials(user)}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">{displayName(user)}</h2>
          <p className="truncate text-sm text-muted-foreground">@{p.username}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                active ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
              }`}
            >
              {active ? 'Activo' : p.status}
            </span>
            {p.isSuperAdmin && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                Superadministrador
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Row icon={Mail}>
          {p.email ?? 'Sin email'}
          {p.emailVerified && <BadgeCheck className="ml-1 inline size-3.5 text-success" />}
        </Row>
        <Row icon={Phone}>{p.phone ?? 'Sin teléfono'}</Row>
        <Row icon={Building2}>{p.organization?.name ?? 'Sin organización'}</Row>
        <Row icon={p.mfaEnabled ? ShieldCheck : ShieldAlert}>
          {p.mfaEnabled ? 'Doble factor activo' : 'Doble factor desactivado'}
        </Row>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
        <div>
          <dt className="text-muted-foreground">Último acceso</dt>
          <dd className="font-medium">{fmtDate(p.lastLoginAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Cuenta creada</dt>
          <dd className="font-medium">{fmtDate(p.createdAt)}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-border pt-4">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Roles</p>
        <div className="flex flex-wrap gap-1.5">
          {p.roles.length === 0 && <span className="text-sm text-muted-foreground">Sin roles asignados</span>}
          {p.roles.map((r) => (
            <span
              key={r.id}
              title={r.description ?? undefined}
              className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium"
            >
              {r.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}