'use client'

import { useCallback, useEffect, useState } from 'react'
import { fiscalService } from '../services/fiscal.service'
import type { FiscalCatalogs, NcfSequence } from '../types'
import { inputCls } from '../utils'

const SALE_TYPES = ['31', '32', '33', '34', '44', '45', '46']
const EMPTY = { ecfType: '31', startNumber: '1', endNumber: '', expiresAt: '' }

interface Props {
  catalogs: FiscalCatalogs | null
  onError: (m: string) => void
}

export function SequencesTab({ catalogs, onError }: Props) {
  const [rows, setRows] = useState<NcfSequence[]>([])
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    fiscalService.sequences().then(setRows).catch((e) => onError(e.message))
  }, [onError])
  useEffect(load, [load])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await fiscalService.createSequence({ ...form, expiresAt: form.expiresAt || undefined })
      setForm(EMPTY)
      load()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'No se pudo registrar la secuencia')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-1 text-sm font-semibold">Registrar rango autorizado por la DGII</h2>
        <p className="mb-3 text-xs text-muted-foreground">Reemplaza el rango activo del mismo tipo.</p>
        <div className="grid grid-cols-2 gap-2">
          <select className={`${inputCls} col-span-2`} value={form.ecfType} onChange={(e) => setForm({ ...form, ecfType: e.target.value })}>
            {SALE_TYPES.map((t) => (
              <option key={t} value={t}>{t} · {catalogs?.ecfTypes[t] ?? ''}</option>
            ))}
          </select>
          <input className={inputCls} inputMode="numeric" placeholder="Desde" value={form.startNumber} onChange={(e) => setForm({ ...form, startNumber: e.target.value })} required />
          <input className={inputCls} inputMode="numeric" placeholder="Hasta *" value={form.endNumber} onChange={(e) => setForm({ ...form, endNumber: e.target.value })} required />
          <label className="col-span-2 text-xs text-muted-foreground">
            Vencimiento
            <input type="date" className={inputCls} value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          </label>
        </div>
        <button type="submit" disabled={saving} className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
          {saving ? 'Guardando…' : 'Registrar rango'}
        </button>
      </form>

      {rows.map((s) => (
        <article key={s.id} className={`rounded-xl border border-border bg-card p-4 ${s.isActive ? '' : 'opacity-60'}`}>
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold">{s.ecfType} · {catalogs?.ecfTypes[s.ecfType] ?? ''}</p>
            <span className="text-[10px] font-semibold uppercase text-muted-foreground">{s.isActive ? 'Activo' : 'Inactivo'}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Próximo: <span className="font-mono">{s.nextEncf ?? '—'}</span> · Disponibles: {s.remaining}
            {s.expiresAt ? ` · Vence ${s.expiresAt}` : ''}
          </p>
        </article>
      ))}
    </div>
  )
}
