'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { apiGet, apiPost } from '@/lib/api'

interface Customer {
  id: string
  name: string
  taxId: string
  customerType: string
  phone: string | null
  email: string | null
  isActive: boolean
}

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', taxId: '', phone: '', email: '' })
  const [saving, setSaving] = useState(false)

  function load() {
    apiGet<Customer[]>('/customers')
      .then(setCustomers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await apiPost('/customers', {
        name: form.name,
        taxId: form.taxId,
        phone: form.phone || undefined,
        email: form.email || undefined,
      })
      setForm({ name: '', taxId: '', phone: '', email: '' })
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
        <h1 className="font-bold">Clientes</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" /> Nuevo
        </button>
      </header>

      <div className="mx-auto max-w-3xl space-y-3 p-4">
        {showForm && (
          <form onSubmit={create} className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Nuevo cliente</h2>
            <div className="grid grid-cols-2 gap-2">
              <input className={`${inputCls} col-span-2`} placeholder="Nombre / Razón social *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className={`${inputCls} col-span-2`} placeholder="RNC o cédula *" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} required />
              <input className={inputCls} placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className={inputCls} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">RNC: 9 dígitos (módulo 11) · Cédula: 11 dígitos</p>
            <button type="submit" disabled={saving} className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {saving ? 'Guardando…' : 'Guardar cliente'}
            </button>
          </form>
        )}

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        {loading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Cargando…</p>}

        {!loading && customers.map((c) => (
          <article key={c.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.taxId} · {c.customerType}</p>
              </div>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">Activo</span>
            </div>
            {(c.phone || c.email) && (
              <p className="mt-1 text-xs text-muted-foreground">{[c.phone, c.email].filter(Boolean).join(' · ')}</p>
            )}
          </article>
        ))}
      </div>
    </main>
  )
}
