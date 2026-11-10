'use client'

import { useEffect, useState } from 'react'
import { Laptop, Loader2, LogOut, MonitorSmartphone, Smartphone } from 'lucide-react'
import { profileService } from '../services/profile.service'
import { useLogout } from '../hooks/use-logout'
import type { ActiveSession } from '../types'
import { fmtDateTime as fmtDate } from '../utils/format'
import { currentSessionId } from '../utils/current-session'

const VISIBLE_SESSIONS = 5

function DeviceIcon({ type }: { type: string | null }) {
  const Icon = type === 'mobile' ? Smartphone : type === 'tablet' ? MonitorSmartphone : Laptop
  return <Icon className="size-5 shrink-0 text-muted-foreground" />
}

export function SessionsList() {
  const logout = useLogout()
  const [sessions, setSessions] = useState<ActiveSession[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const visible = showAll ? sessions : sessions?.slice(0, VISIBLE_SESSIONS)

  function load() {
    const current = currentSessionId()
    setCurrentId(current)
    profileService
      .sessions()
      .then((list) => setSessions([...list].sort((a, b) => Number(b.id === current) - Number(a.id === current))))
      .catch((e: Error) => setError(e.message))
  }
  useEffect(load, [])

  async function close(id: string) {
    if (id === currentId) {
      setBusy(id)
      await logout()
      return
    }
    setBusy(id)
    setError(null)
    try {
      await profileService.closeSession(id)
      setSessions((s) => s?.filter((x) => x.id !== id) ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cerrar la sesión')
    } finally {
      setBusy(null)
    }
  }

  async function closeAll() {
    if (!confirm('Se cerrarán todas tus sesiones, incluida esta. ¿Continuar?')) return
    setBusy('all')
    try {
      await profileService.logoutEverywhere()
    } finally {
      logout()
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Sesiones activas</h2>
        <button
          type="button"
          onClick={closeAll}
          disabled={busy !== null}
          className="flex items-center gap-1.5 rounded-lg border border-destructive/40 px-2.5 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/10 disabled:opacity-60"
        >
          {busy === 'all' ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
          Cerrar todas
        </button>
      </div>

      {error && <p className="mb-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
      {!sessions && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando…
        </p>
      )}
      {sessions?.length === 0 && <p className="text-sm text-muted-foreground">No hay sesiones registradas.</p>}

      <ul className="divide-y divide-border">
        {visible?.map((s) => (
          <li key={s.id} className="flex items-center gap-3 py-3">
            <DeviceIcon type={s.deviceType} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <span className="truncate">{s.deviceName ?? `${s.browser ?? '?'} · ${s.os ?? '?'}`}</span>
                {s.id === currentId && (
                  <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                    Este dispositivo
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {s.ipAddress ?? 'IP desconocida'} · {fmtDate(s.lastActivityAt ?? s.createdAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => close(s.id)}
              disabled={busy !== null}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-60"
            >
              {busy === s.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : s.id === currentId ? (
                'Salir'
              ) : (
                'Cerrar'
              )}
            </button>
          </li>
        ))}
      </ul>
      {sessions && sessions.length > VISIBLE_SESSIONS && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-1 w-full rounded-lg py-2 text-xs font-medium text-primary transition hover:bg-secondary"
        >
          {showAll ? 'Ver menos' : `Ver todas (${sessions.length})`}
        </button>
      )}
    </section>
  )
}
