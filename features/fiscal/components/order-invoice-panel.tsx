'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { FileCheck2, Loader2 } from 'lucide-react'
import { fiscalService } from '../services/fiscal.service'
import type { FiscalDocument } from '../types'
import { DOC_STATUS, dop } from '../utils'

interface Props {
  orderId: string
  orderStatus: string
  onError: (m: string) => void
}

/** e-CF de venta del pedido: muestra el vigente o permite emitirlo. */
export function OrderInvoicePanel({ orderId, orderStatus, onError }: Props) {
  const [docs, setDocs] = useState<FiscalDocument[] | null>(null)
  const [emitting, setEmitting] = useState(false)

  const load = useCallback(() => {
    fiscalService.documents(undefined, orderId).then(setDocs).catch(() => setDocs([]))
  }, [orderId])
  useEffect(load, [load])

  async function emit() {
    if (!window.confirm('¿Emitir el comprobante fiscal electrónico de este pedido?')) return
    setEmitting(true)
    try {
      await fiscalService.emit({ orderId })
      load()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'No se pudo emitir el e-CF')
    } finally {
      setEmitting(false)
    }
  }

  if (docs === null) return null
  const valid = docs.find((d) => d.status !== 'CANCELLED' && d.status !== 'REJECTED')

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-2 text-sm font-semibold">Comprobante fiscal (e-CF)</h2>
      {valid ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono font-semibold">{valid.encf}</p>
            <p className="text-xs text-muted-foreground">
              {valid.issueDate} · {dop(valid.totalDop)}
              {valid.provider === 'mock' && <span className="text-warning"> · simulado</span>}
            </p>
          </div>
          <Link href="/fiscal" className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${DOC_STATUS[valid.status]?.className ?? ''}`}>
            {DOC_STATUS[valid.status]?.label ?? valid.status}
          </Link>
        </div>
      ) : orderStatus === 'CANCELLED' ? (
        <p className="text-sm text-muted-foreground">Pedido cancelado.</p>
      ) : (
        <button
          onClick={emit}
          disabled={emitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-2.5 text-sm font-semibold text-secondary-foreground disabled:opacity-60"
        >
          {emitting ? <Loader2 className="size-4 animate-spin" /> : <FileCheck2 className="size-4" />}
          Emitir e-CF
        </button>
      )}
    </section>
  )
}
