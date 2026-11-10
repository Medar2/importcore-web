'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { apiGet, apiPost } from '@/lib/api'

interface Product {
  id: string
  sku: string
  description: string
  unitsPerBox: number
  boxLengthM: string
  boxWidthM: string
  boxHeightM: string
  boxGrossWeightKg: string | null
  unitFobPriceUsd: string | null
  vendor?: { name: string } | null
  tariffHeading?: { hsCode: string; description: string } | null
}

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

const EMPTY = {
  sku: '', description: '', unitsPerBox: '1',
  boxLengthM: '', boxWidthM: '', boxHeightM: '',
  boxGrossWeightKg: '', unitFobPriceUsd: '', tariffHeadingId: '',
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function load() {
    apiGet<Product[]>('/products').then(setProducts).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await apiPost('/products', {
        sku: form.sku,
        description: form.description,
        unitsPerBox: Number(form.unitsPerBox),
        boxLengthM: form.boxLengthM,
        boxWidthM: form.boxWidthM,
        boxHeightM: form.boxHeightM,
        boxGrossWeightKg: form.boxGrossWeightKg || undefined,
        unitFobPriceUsd: form.unitFobPriceUsd || undefined,
        tariffHeadingId: form.tariffHeadingId || undefined,
      })
      setForm(EMPTY)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  const cbm = (p: Product) =>
    (Number(p.boxLengthM) * Number(p.boxWidthM) * Number(p.boxHeightM)).toFixed(4)

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Productos</h1>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
          <Plus className="size-4" /> Nuevo
        </button>
      </header>

      <div className="mx-auto max-w-3xl space-y-3 p-4">
        {showForm && (
          <form onSubmit={create} className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Nuevo producto</h2>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="SKU *" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
              <input className={inputCls} placeholder="Descripción *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              <input className={inputCls} type="number" min={1} placeholder="Unidades/caja" value={form.unitsPerBox} onChange={(e) => setForm({ ...form, unitsPerBox: e.target.value })} />
              <input className={inputCls} placeholder="FOB unit USD" value={form.unitFobPriceUsd} onChange={(e) => setForm({ ...form, unitFobPriceUsd: e.target.value })} />
              <input className={inputCls} placeholder="Largo caja (m)" value={form.boxLengthM} onChange={(e) => setForm({ ...form, boxLengthM: e.target.value })} required />
              <input className={inputCls} placeholder="Ancho caja (m)" value={form.boxWidthM} onChange={(e) => setForm({ ...form, boxWidthM: e.target.value })} required />
              <input className={inputCls} placeholder="Alto caja (m)" value={form.boxHeightM} onChange={(e) => setForm({ ...form, boxHeightM: e.target.value })} required />
              <input className={inputCls} placeholder="Peso caja kg" value={form.boxGrossWeightKg} onChange={(e) => setForm({ ...form, boxGrossWeightKg: e.target.value })} />
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">CBM/caja = L × W × H — dimensiones en metros</p>
            <button type="submit" disabled={saving} className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {saving ? 'Guardando…' : 'Guardar producto'}
            </button>
          </form>
        )}

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        {loading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Cargando…</p>}

        {!loading && products.map((p) => (
          <article key={p.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{p.sku}</p>
                <p className="text-xs text-muted-foreground">{p.description}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {cbm(p)} CBM/caja
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {p.unitsPerBox} unid/caja
              {p.unitFobPriceUsd ? ` · FOB $${Number(p.unitFobPriceUsd).toFixed(2)}` : ''}
              {p.vendor ? ` · ${p.vendor.name}` : ''}
              {p.tariffHeading ? ` · HS ${p.tariffHeading.hsCode}` : ''}
            </p>
          </article>
        ))}
      </div>
    </main>
  )
}
