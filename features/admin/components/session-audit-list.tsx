'use client'

import { useEffect, useState } from 'react'
import { Loader2, MonitorSmartphone, Search } from 'lucide-react'
import { fmtDateTime, fmtDuration } from '@/features/auth/utils/format'
import {
  auditAdminService,
  type SessionAuditRow,
} from '../services/audit-admin.service'

const reasonCls: Record<string, string> = {
  LOGOUT: 'bg-muted text-muted-foreground',
  EXPIRED: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  ALL_CLOSED: 'bg-muted text-muted-foreground',
  PASSWORD_RESET: 'bg-destructive/15 text-destructive',
  REVOKED: 'bg-destructive/15 text-destructive',
}

export function SessionAuditList() {
  const [sessions, setSessions] = useState<SessionAuditRow[] | null>(null)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all')

  function load() {
    setSessions(null)
    setError(null)
    auditAdminService
      .listSessions({
        userId: userId.trim() || undefined,
        isActive: filter === 'all' ? undefined : filter === 'active',
        limit: 200,
      })
      .then((r) => {
        setSessions(r.data)
        setTotal(r.total)
      })
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
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="ID de usuario (UUID)"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">Todas</option>
          <option value="active">Activas</option>
          <option value="closed">Cerradas</option>
        </select>
        <button
          type="button"
          onClick={load}
          className="flex items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary"
        >
          <Search className="size-4" />
          Buscar
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {!sessions && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando sesiones…
        </p>
      )}
      {sessions && (
        <p className="text-xs text-muted-foreground">
          {total} sesión(es)
        </p>
      )}

      <ul className="space-y-2">
        {(sessions ?? []).map((s) => (
          <li
            key={s.id}
            className="rounded-xl border border-border bg-card p-3 text-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <span className="font-semibold">
                {s.userEmail ?? s.username ?? s.userId}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  s.isActive
                    ? 'bg-success/15 text-success'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s.isActive ? 'ACTIVA' : s.closeReason ?? 'CERRADA'}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MonitorSmartphone className="size-3" />
              {s.deviceName ?? s.browser ?? 'Dispositivo desconocido'}
              {s.os ? ` · ${s.os}` : ''}
              {s.ipAddress ? ` · ${s.ipAddress}` : ''}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span>Inicio: {fmtDateTime(s.createdAt)}</span>
              <span>Última actividad: {fmtDateTime(s.lastActivityAt)}</span>
              {s.closedAt && <span>Cierre: {fmtDateTime(s.closedAt)}</span>}
              <span className="font-medium text-foreground">
                Duración: {fmtDuration(s.durationMs)}
              </span>
            </div>
            {s.closeReason && !s.isActive && (
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${reasonCls[s.closeReason] ?? 'bg-muted text-muted-foreground'}`}
              >
                {s.closeReason}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
