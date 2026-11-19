'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Loader2, Plus, Search } from 'lucide-react'
import { apiPost } from '@/lib/api'
import { customersService } from '@/features/customers/services/customers.service'
import type { CustomerPage } from '@/features/customers/services/customers.service'
import type { Customer } from '@/features/customers/types'
import { withPermission } from '@/features/auth/components/permission-gate'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'
import { IMPORTCORE_PERMS, can } from '@/features/auth/utils/permissions'

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

const PAGE_SIZES = [10, 20, 50]

function CustomersPageContent() {
  const { user } = useCurrentUser()
  const canWrite = can(user, IMPORTCORE_PERMS.CUSTOMERS_WRITE)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [data, setData] = useState<CustomerPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', taxId: '', phone: '', email: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  function load() {
    setLoading(true)
    setError(null)
    customersService
      .listPage({ search: debouncedSearch, page, pageSize })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [debouncedSearch, page, pageSize])

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
      setPage(1)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Clientes</h1>
        {canWrite && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" /> Nuevo
          </button>
        )}
      </header>

      <div className="mx-auto max-w-3xl space-y-3 p-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, RNC/cédula, email o teléfono…"
            className={`${inputCls} pl-9`}
          />
        </label>

        {showForm && canWrite && (
          <form onSubmit={create} className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Nuevo cliente</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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

        {!loading && data && data.items.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {debouncedSearch ? 'Sin clientes para esa búsqueda.' : 'Sin clientes registrados.'}
          </p>
        )}

        {data?.items.map((c: Customer) => (
          <article key={c.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/customers/${c.id}`} className="font-semibold text-primary hover:underline">
                  {c.name}
                </Link>
                <p className="text-xs text-muted-foreground">{c.taxId} · {c.customerType}</p>
              </div>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">Activo</span>
            </div>
            {(c.phone || c.email) && (
              <p className="mt-1 text-xs text-muted-foreground">{[c.phone, c.email].filter(Boolean).join(' · ')}</p>
            )}
          </article>
        ))}

        {data && data.total > 0 && (
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {data.total} cliente(s) · página {data.page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs outline-none"
                aria-label="Clientes por página"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} / página
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium disabled:opacity-40"
              >
                <ChevronLeft className="size-3.5" /> Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium disabled:opacity-40"
              >
                Siguiente <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default withPermission([IMPORTCORE_PERMS.CUSTOMERS_READ], CustomersPageContent)
