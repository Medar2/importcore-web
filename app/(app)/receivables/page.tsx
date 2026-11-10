'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BellRing, Loader2 } from 'lucide-react'
import { receivablesService } from '@/features/receivables/services/receivables.service'
import type { AgingBucket, AgingReport } from '@/features/receivables/types'
import { AgingSummary, BUCKET_META, usd } from '@/features/receivables/components/aging-summary'

export default function ReceivablesPage() {
  const [report, setReport] = useState<AgingReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [bucket, setBucket] = useState<AgingBucket | null>(null)
  const [running, setRunning] = useState(false)

  function load() {
    receivablesService
      .aging()
      .then(setReport)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function runReminders() {
    setRunning(true)
    setError(null)
    try {
      const r = await receivablesService.runReminders()
      setNotice(
        `${r.sent.length} recordatorio(s) enviado(s)` +
          (r.withoutEmail.length ? ` · ${r.withoutEmail.length} cliente(s) sin email: ${r.withoutEmail.join(', ')}` : ''),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar recordatorios')
    } finally {
      setRunning(false)
    }
  }

  const items = report?.items.filter((i) => !bucket || i.bucket === bucket) ?? []

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Cuentas por cobrar</h1>
        <button
          onClick={runReminders}
          disabled={running}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {running ? <Loader2 className="size-4 animate-spin" /> : <BellRing className="size-4" />}
          <span className="hidden sm:inline">Enviar recordatorios</span>
        </button>
      </header>

      <div className="mx-auto max-w-3xl space-y-3 p-4">
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        {notice && <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{notice}</p>}
        {loading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Cargando…
          </p>
        )}

        {report && <AgingSummary report={report} selected={bucket} onSelect={setBucket} />}

        {report && items.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Sin saldos pendientes{bucket ? ' en este tramo' : ''}.
          </p>
        )}

        {items.map((i) => (
          <Link
            key={i.orderId}
            href={`/orders/${i.orderId}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40"
          >
            <div className="min-w-0">
              <p className="font-semibold">{i.orderNumber}</p>
              <p className="truncate text-xs text-muted-foreground">{i.customerName || 'Sin cliente'}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-bold">{usd(i.balanceUsd)}</p>
              <p className={`text-[11px] font-semibold ${BUCKET_META[i.bucket].className}`}>{i.days} días</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
