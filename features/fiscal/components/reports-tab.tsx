'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { fiscalService } from '../services/fiscal.service'
import { fromMonthInput, inputCls, toMonthInput } from '../utils'

const REPORTS = [
  { format: '606', title: '606 · Compras de bienes y servicios', source: 'Compras locales registradas en la pestaña Compras' },
  { format: '607', title: '607 · Ventas de bienes y servicios', source: 'e-CF emitidos vigentes (aceptados)' },
  { format: '608', title: '608 · Comprobantes anulados', source: 'e-CF anulados en el período' },
] as const

interface Props {
  period: string
  onPeriodChange: (p: string) => void
  onError: (m: string) => void
}

export function ReportsTab({ period, onPeriodChange, onError }: Props) {
  const [busy, setBusy] = useState<string | null>(null)

  async function download(format: (typeof REPORTS)[number]['format']) {
    setBusy(format)
    try {
      await fiscalService.downloadReport(format, period)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'No se pudo generar el reporte')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-3">
      <input type="month" className={`${inputCls} max-w-48`} value={toMonthInput(period)} onChange={(e) => e.target.value && onPeriodChange(fromMonthInput(e.target.value))} />
      {REPORTS.map((r) => (
        <article key={r.format} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
          <div className="min-w-0">
            <p className="font-semibold">{r.title}</p>
            <p className="text-xs text-muted-foreground">{r.source}</p>
          </div>
          <button
            onClick={() => download(r.format)}
            disabled={busy !== null}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy === r.format ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            TXT
          </button>
        </article>
      ))}
      <p className="text-xs text-muted-foreground">
        Archivo para la Oficina Virtual de la DGII. Valídelo con la herramienta oficial antes de enviarlo.
      </p>
    </div>
  )
}
