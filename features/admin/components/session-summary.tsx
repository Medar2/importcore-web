'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { fmtDuration } from '@/features/auth/utils/format'
import {
  auditAdminService,
  type SessionSummaryRow,
} from '../services/audit-admin.service'

export function SessionSummary() {
  const [rows, setRows] = useState<SessionSummaryRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    auditAdminService
      .sessionSummary()
      .then(setRows)
      .catch((e: Error) => setError(e.message))
  }, [])

  if (error) {
    return (
      <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {error}
      </p>
    )
  }
  if (!rows) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Cargando resumen…
      </p>
    )
  }
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin sesiones registradas.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead className="bg-muted/50 text-left text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Usuario</th>
            <th className="px-3 py-2 font-medium">Sesiones</th>
            <th className="px-3 py-2 font-medium">Activas</th>
            <th className="px-3 py-2 font-medium">Tiempo total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.userId} className="border-t border-border">
              <td className="px-3 py-2">
                <span className="font-medium">
                  {r.userEmail ?? r.username ?? r.userId}
                </span>
              </td>
              <td className="px-3 py-2">{r.totalSessions}</td>
              <td className="px-3 py-2">{r.activeSessions}</td>
              <td className="px-3 py-2 font-medium">
                {fmtDuration(r.totalDurationMs)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
