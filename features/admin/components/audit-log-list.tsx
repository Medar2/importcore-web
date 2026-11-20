'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Loader2, Search } from 'lucide-react'
import { fmtDateTime } from '@/features/auth/utils/format'
import {
  auditAdminService,
  type AuditLogRow,
} from '../services/audit-admin.service'

const resultCls: Record<AuditLogRow['result'], string> = {
  success: 'bg-success/15 text-success',
  failure: 'bg-destructive/15 text-destructive',
  denied: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
}

function fmtValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function ChangeDiff({ log }: { log: AuditLogRow }) {
  const [open, setOpen] = useState(false)
  const changes = log.metadata?.changes
  if (!changes || Object.keys(changes).length === 0) return null

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-[11px] font-medium text-primary"
      >
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        Ver cambios ({Object.keys(changes).length})
      </button>
      {open && (
        <table className="mt-1 w-full text-[11px]">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-1 pr-2 font-medium">Campo</th>
              <th className="py-1 pr-2 font-medium">Antes</th>
              <th className="py-1 font-medium">Después</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(changes).map(([field, c]) => (
              <tr key={field} className="border-t border-border/60 align-top">
                <td className="py-1 pr-2 font-mono">{field}</td>
                <td className="py-1 pr-2 text-destructive/80">{fmtValue(c.from)}</td>
                <td className="py-1 text-success/90">{fmtValue(c.to)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export function AuditLogList() {
  const [logs, setLogs] = useState<AuditLogRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [action, setAction] = useState('')
  const [email, setEmail] = useState('')
  const [resource, setResource] = useState('')
  const [result, setResult] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  function load() {
    setLogs(null)
    setError(null)
    auditAdminService
      .list({
        action: action.trim() || undefined,
        userEmail: email.trim() || undefined,
        resource: resource.trim() || undefined,
        result: (result || undefined) as AuditLogRow['result'] | undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      })
      .then(setLogs)
      .catch((e: Error) => setError(e.message))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial
  }, [])

  const inputCls =
    'rounded-lg border border-input bg-background px-3 py-2 text-sm'

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Acción (ej. LOGIN_SUCCESS)"
          className={inputCls}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email usuario"
          className={inputCls}
        />
        <input
          value={resource}
          onChange={(e) => setResource(e.target.value)}
          placeholder="Recurso (ej. Order)"
          className={inputCls}
        />
        <select value={result} onChange={(e) => setResult(e.target.value)} className={inputCls}>
          <option value="">Todos los resultados</option>
          <option value="success">success</option>
          <option value="failure">failure</option>
          <option value="denied">denied</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={inputCls}
          title="Desde"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={inputCls}
          title="Hasta"
        />
      </div>
      <button
        type="button"
        onClick={load}
        className="flex items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary"
      >
        <Search className="size-4" />
        Buscar
      </button>
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
              <span className="font-semibold">
                {l.action}
                <span className="ml-2 font-normal text-muted-foreground">{l.resource}</span>
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${resultCls[l.result]}`}>
                {l.result}
              </span>
            </div>
            <p className="mt-1 text-muted-foreground">
              {l.userEmail ?? ''}
              {l.ipAddress ? ` · ${l.ipAddress}` : ''}
              {l.endpoint ? ` · ${l.method ?? ''} ${l.endpoint}` : ''}
            </p>
            {l.reason && <p className="mt-1 text-[11px] text-muted-foreground">{l.reason}</p>}
            <ChangeDiff log={l} />
            <p className="mt-1 text-[11px] text-muted-foreground">{fmtDateTime(l.timestamp)}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
