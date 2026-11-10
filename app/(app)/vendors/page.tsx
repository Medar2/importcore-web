'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { apiGet, apiPost } from '@/lib/api'

interface Vendor {
  id: string
  name: string
  tradeName: string | null
  countryCode: string
  contact: string | null
  phone: string | null
  email: string | null
}

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', contact: '', phone: '', email: '', countryCode: 'CN', paymentTerms: '' })
  const [saving, setSaving] = useState(false)

  function load() {
    apiGet<Vendor[]>('/vendors').then(setVendors).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await apiPost('/vendors', {
        name: form.name,
        countryCode: form.countryCode,
        contact: form.contact || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        paymentTerms: form.paymentTerms || undefined,
      })
      setForm({ name: '', contact: '', phone: '', email: '', countryCode: 'CN', paymentTerms: '' })
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
        <h1 className="font-bold">Proveedores</h1>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
          <Plus className="size-4" /> Nuevo
        </button>
      </header>

      <div className="mx-auto max-w-3xl space-y-3 p-4">
        {showForm && (
          <form onSubmit={create} className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Nuevo proveedor</h2>
            <div className="grid grid-cols-2 gap-2">
              <input className={`${inputCls} col-span-2`} placeholder="Nombre / empresa *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className={inputCls} placeholder="Contacto" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              <input className={inputCls} placeholder="País (CN)" value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value })} />
              <input className={inputCls} placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className={inputCls} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className={`${inputCls} col-span-2`} placeholder="Términos de pago (ej. T/T 30%)" value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} />
            </div>
            <button type="submit" disabled={saving} className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {saving ? 'Guardando…' : 'Guardar proveedor'}
            </button>
          </form>
        )}

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        {loading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Cargando…</p>}

        {!loading && vendors.map((v) => (
          <article key={v.id} className="rounded-xl border border-border bg-card p-4">
            <p className="font-semibold">{v.name}</p>
            <p className="text-xs text-muted-foreground">
              {v.tradeName ? `${v.tradeName} · ` : ''}{v.countryCode}
              {v.contact ? ` · ${v.contact}` : ''}
            </p>
          </article>
        ))}
      </div>
    </main>
  )
}
