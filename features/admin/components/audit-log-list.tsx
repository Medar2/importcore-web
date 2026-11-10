'use client'

import { useEffect, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { fmtDateTime } from '@/features/auth/utils/format'
import { auditAdminService, type AuditLogRow } from '../services/audit-admin.service'

const resultCls: Record<AuditLogRow['result'], string> = {
  success: 'bg-success/15 text-success',
  failure: 'bg-destructive/15 text-destructive',
  denied: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
}

export function AuditLogList() {
  const [logs, setLogs] = useState<AuditLogRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [action, setAction] = useState('')
  const [email, setEmail] = useState('')

  function load() {
    setLogs(null)
    setError(null)
    auditAdminService
      .list({ action: action.trim() || undefined, userEmail: email.trim() || undefined })
      .then(setLogs)
      .catch((e: Error) => setError(e.message))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Filtrar acción (ej. LOGIN_SUCCESS)"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email usuario"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={load}
          className="flex items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary"
        >
          <Search className="size-4" />
          Buscar
        </button>
      </div>
      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      {!logs && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando bitácora…
        </p>
      )}
      {logs && (
        <p className="text-xs text-muted-foreground">{logs.length} evento(s) · últimos registros</p>
      )}
      <ul className="space-y-2">
        {(logs ?? []).map((l) => (
          <li key={l.id} className="rounded-xl border border-border bg-card p-3 text-xs">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <span className="font-semibold">{l.action}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${resultCls[l.result]}`}>
                {l.result}
              </span>
            </div>
            <p className="mt-1 text-muted-foreground">
              {l.resource}
              {l.userEmail ? ` · ${l.userEmail}` : ''}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">{fmtDateTime(l.timestamp)}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
