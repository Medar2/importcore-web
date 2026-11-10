'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { apiGet, apiPost } from '@/lib/api'

interface ExchangeRate {
  id: string
  baseCurrency: string
  quoteCurrency: string
  rate: string
  effectiveDate: string
  source: string
}

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ baseCurrency: 'USD', quoteCurrency: 'DOP', rate: '', effectiveDate: new Date().toISOString().slice(0, 10), source: 'MANUAL' })
  const [saving, setSaving] = useState(false)

  function load() {
    apiGet<ExchangeRate[]>('/exchange-rates').then(setRates).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await apiPost('/exchange-rates', form)
      setForm({ ...form, rate: '' })
      setShowForm(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Tasas de cambio</h1>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
          <Plus className="size-4" /> Nueva
        </button>
      </header>

      <div className="mx-auto max-w-3xl space-y-3 p-4">
        {showForm && (
          <form onSubmit={create} className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Registrar tasa</h2>
            <div className="grid grid-cols-2 gap-2">
              <select className={inputCls} value={form.baseCurrency} onChange={(e) => setForm({ ...form, baseCurrency: e.target.value })}>
                {['USD', 'DOP', 'CNY'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className={inputCls} value={form.quoteCurrency} onChange={(e) => setForm({ ...form, quoteCurrency: e.target.value })}>
                {['USD', 'DOP', 'CNY'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className={inputCls} placeholder="Tasa (ej. 60.50)" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} required />
              <input className={inputCls} type="date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} required />
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">Unidades de moneda destino por 1 unidad de origen · upsert por fecha</p>
            <button type="submit" disabled={saving} className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {saving ? 'Guardando…' : 'Guardar tasa'}
            </button>
          </form>
        )}

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        {loading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Cargando…</p>}

        {!loading && rates.map((r) => (
          <article key={r.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{r.baseCurrency} → {r.quoteCurrency}</p>
              <p className="text-lg font-bold text-primary">{Number(r.rate).toFixed(4)}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Vigente {r.effectiveDate} · fuente {r.source}
            </p>
          </article>
        ))}
      </div>
    </main>
  )
}
