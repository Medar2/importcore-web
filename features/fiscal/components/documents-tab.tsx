'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { fiscalService } from '../services/fiscal.service'
import type { FiscalCatalogs, FiscalDocument } from '../types'
import { DOC_STATUS, dop, fromMonthInput, inputCls, toMonthInput } from '../utils'

interface Props {
  period: string
  onPeriodChange: (p: string) => void
  catalogs: FiscalCatalogs | null
  onError: (m: string) => void
}

export function DocumentsTab({ period, onPeriodChange, catalogs, onError }: Props) {
  const [docs, setDocs] = useState<FiscalDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [cancelType, setCancelType] = useState('04')
  const [reason, setReason] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    fiscalService.documents(period).then(setDocs).catch((e) => onError(e.message)).finally(() => setLoading(false))
  }, [period, onError])
  useEffect(load, [load])

  async function confirmCancel(id: string) {
    try {
      await fiscalService.cancel(id, cancelType, reason)
      setCancelling(null)
      setReason('')
      load()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'No se pudo anular')
    }
  }

  return (
    <div className="space-y-3">
      <input type="month" className={`${inputCls} max-w-48`} value={toMonthInput(period)} onChange={(e) => e.target.value && onPeriodChange(fromMonthInput(e.target.value))} />
      {loading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Cargando…</p>}
      {!loading && docs.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Sin comprobantes en este período. Se emiten desde el detalle del pedido.
        </p>
      )}

      {docs.map((d) => (
        <article key={d.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono font-semibold">{d.encf}</p>
              <p className="truncate text-xs text-muted-foreground">
                {d.buyerName} · {d.issueDate} · {catalogs?.ecfTypes[d.ecfType] ?? d.ecfType}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${DOC_STATUS[d.status]?.className ?? ''}`}>
              {DOC_STATUS[d.status]?.label ?? d.status}
            </span>
          </div>
          <p className="mt-2 text-sm">
            <b>{dop(d.totalDop)}</b>
            <span className="text-muted-foreground"> · ITBIS {dop(d.itbisDop)} · tasa {d.exchangeRate}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {d.provider === 'mock' && <span className="font-semibold text-warning">Simulado — sin validez fiscal</span>}
            {d.securityCode && <span>Código: {d.securityCode}</span>}
            {d.orderId && <Link href={`/orders/${d.orderId}`} className="underline">Ver pedido</Link>}
            {d.status !== 'CANCELLED' && cancelling !== d.id && (
              <button onClick={() => setCancelling(d.id)} className="text-destructive underline">Anular</button>
            )}
          </div>

          {cancelling === d.id && (
            <div className="mt-3 grid gap-2 rounded-lg border border-destructive/30 p-3">
              <select className={inputCls} value={cancelType} onChange={(e) => setCancelType(e.target.value)}>
                {Object.entries(catalogs?.cancellationTypes ?? {}).map(([k, v]) => (
                  <option key={k} value={k}>{k} · {v}</option>
                ))}
              </select>
              <input className={inputCls} placeholder="Motivo (mín. 5 caracteres)" value={reason} onChange={(e) => setReason(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={() => confirmCancel(d.id)} disabled={reason.trim().length < 5} className="flex-1 rounded-lg bg-destructive py-2 text-sm font-semibold text-white disabled:opacity-50">Confirmar anulación</button>
                <button onClick={() => setCancelling(null)} className="rounded-lg border border-border px-3 text-sm">Volver</button>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  )
}
