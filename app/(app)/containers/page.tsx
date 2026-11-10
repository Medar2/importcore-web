'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Ship } from 'lucide-react'
import { apiGet, apiPost } from '@/lib/api'

interface Container {
  id: string
  containerNumber: string
  containerType: string
  status: string
  blNumber: string | null
  etd: string | null
  eta: string | null
  ata: string | null
}

interface OptimizeResult {
  containerType: string
  containerCount: number
  cbmUtilizationPct: string
  weightUtilizationPct: string
  fitsSingleFcl: boolean
}

interface Demurrage {
  container: string
  daysOverdue: number | null
  estimatedCostUsd: string | null
}

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

const STATUS_STYLE: Record<string, string> = {
  PLANNED: 'bg-muted text-muted-foreground',
  LOADED: 'bg-info/15 text-info',
  IN_TRANSIT: 'bg-warning/15 text-warning',
  ARRIVED: 'bg-primary/15 text-primary',
  DELIVERED: 'bg-success/15 text-success',
  RETURNED: 'bg-muted text-muted-foreground',
}

export default function ContainersPage() {
  const [containers, setContainers] = useState<Container[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ containerNumber: '', containerType: '40_HC', blNumber: '', etd: '', eta: '', demurrageDailyRateUsd: '150' })
  const [saving, setSaving] = useState(false)
  const [optCbm, setOptCbm] = useState('')
  const [optKg, setOptKg] = useState('')
  const [optResult, setOptResult] = useState<OptimizeResult | null>(null)
  const [demurrage, setDemurrage] = useState<Record<string, Demurrage>>({})

  function load() {
    apiGet<Container[]>('/shipping/containers').then(setContainers).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  useEffect(() => {
    containers.forEach((c) => {
      apiGet<Demurrage>(`/shipping/containers/${c.id}/demurrage`)
        .then((d) => setDemurrage((m) => ({ ...m, [c.id]: d })))
        .catch(() => {})
    })
  }, [containers])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await apiPost('/shipping/containers', {
        containerNumber: form.containerNumber,
        containerType: form.containerType,
        blNumber: form.blNumber || undefined,
        etd: form.etd || undefined,
        eta: form.eta || undefined,
        demurrageDailyRateUsd: form.demurrageDailyRateUsd || undefined,
      })
      setForm({ ...form, containerNumber: '', blNumber: '' })
      setShowForm(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  async function optimize() {
    setError(null)
    try {
      const r = await apiPost<OptimizeResult>('/shipping/optimize', { totalCbm: optCbm, totalWeightKg: optKg })
      setOptResult(r)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    }
  }

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Contenedores</h1>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
          <Plus className="size-4" /> Nuevo
        </button>
      </header>

      <div className="mx-auto max-w-3xl space-y-3 p-4">
        {/* Optimizador CBM */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Ship className="size-4 text-primary" /> Optimizar carga</h2>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              CBM total
              <input className={inputCls} placeholder="ej. 45.5" value={optCbm} onChange={(e) => setOptCbm(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Peso total (kg)
              <input className={inputCls} placeholder="ej. 12000" value={optKg} onChange={(e) => setOptKg(e.target.value)} />
            </label>
            <button onClick={optimize} className="col-span-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Calcular</button>
          </div>
          {optResult && (
            <p className="mt-2 text-sm">
              <b>{optResult.containerCount}× {optResult.containerType}</b>
              <span className="text-muted-foreground">
                {' '}· CBM {optResult.cbmUtilizationPct}% · peso {optResult.weightUtilizationPct}%
                {optResult.fitsSingleFcl ? ' · cabe en 1' : ' · multi-contenedor'}
              </span>
            </p>
          )}
        </section>

        {showForm && (
          <form onSubmit={create} className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Nuevo contenedor</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Número de contenedor *
                <input className={inputCls} placeholder="ej. MSKU-123456-7" value={form.containerNumber} onChange={(e) => setForm({ ...form, containerNumber: e.target.value })} required />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Tipo de contenedor
                <select className={inputCls} value={form.containerType} onChange={(e) => setForm({ ...form, containerType: e.target.value })}>
                  <option value="20_ST">20 pies seco (28 CBM)</option>
                  <option value="40_ST">40 pies seco (58 CBM)</option>
                  <option value="40_HC">40 pies alto (68 CBM)</option>
                  <option value="LCL">LCL / consolidado</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                BL (Bill of Lading)
                <input className={inputCls} placeholder="ej. MAEU123456789" value={form.blNumber} onChange={(e) => setForm({ ...form, blNumber: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Demurrage ($/día)
                <input className={inputCls} placeholder="ej. 150" value={form.demurrageDailyRateUsd} onChange={(e) => setForm({ ...form, demurrageDailyRateUsd: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                ETD — zarpe
                <input className={inputCls} type="date" value={form.etd} onChange={(e) => setForm({ ...form, etd: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                ETA — arribo estimado
                <input className={inputCls} type="date" value={form.eta} onChange={(e) => setForm({ ...form, eta: e.target.value })} />
              </label>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              ETD = Estimated Time of Departure · ETA = Estimated Time of Arrival · Demurrage = tarifa por día de estadía en puerto
            </p>
            <button type="submit" disabled={saving} className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {saving ? 'Guardando…' : 'Guardar contenedor'}
            </button>
          </form>
        )}

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        {loading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Cargando…</p>}

        {!loading && containers.map((c) => {
          const d = demurrage[c.id]
          return (
            <article key={c.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{c.containerNumber}</p>
                  <p className="text-xs text-muted-foreground">{c.containerType}{c.blNumber ? ` · BL ${c.blNumber}` : ''}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[c.status] ?? ''}`}>{c.status}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                ETD {c.etd ?? '—'} · ETA {c.eta ?? '—'} · ATA —
              </p>
              {d && d.daysOverdue !== null && d.daysOverdue > 0 && (
                <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
                  Demurrage: {d.daysOverdue} días · ~${Number(d.estimatedCostUsd).toFixed(2)}
                </p>
              )}
            </article>
          )
        })}
      </div>
    </main>
  )
}
