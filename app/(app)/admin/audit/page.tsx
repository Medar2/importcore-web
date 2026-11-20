'use client'

import { useState } from 'react'
import { AuditLogList } from '@/features/admin/components/audit-log-list'
import { SessionAuditList } from '@/features/admin/components/session-audit-list'
import { SessionSummary } from '@/features/admin/components/session-summary'
import { PermissionGate } from '@/features/auth/components/permission-gate'
import { PERM } from '@/features/auth/utils/permissions'

type Tab = 'events' | 'sessions' | 'summary'

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: 'events', label: 'Eventos', hint: 'Accesos, acciones y cambios de datos' },
  { id: 'sessions', label: 'Sesiones', hint: 'Sesiones de usuario y tiempo en sesión' },
  { id: 'summary', label: 'Resumen', hint: 'Tiempo total por usuario' },
]

export default function AdminAuditPage() {
  const [tab, setTab] = useState<Tab>('events')
  const active = TABS.find((t) => t.id === tab)!

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Auditoría</h1>
        <p className="text-xs text-muted-foreground">{active.hint}.</p>
      </header>
      <PermissionGate anyOf={[PERM.AUDIT_VIEW]}>
        {() => (
          <div className="mx-auto max-w-3xl p-4">
            <div className="mb-4 flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    tab === t.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {tab === 'events' && <AuditLogList />}
            {tab === 'sessions' && <SessionAuditList />}
            {tab === 'summary' && <SessionSummary />}
          </div>
        )}
      </PermissionGate>
    </main>
  )
}
