'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { customersService } from '@/features/customers/services/customers.service'
import type { Customer } from '@/features/customers/types'

function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : '—'
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    customersService
      .get(id)
      .then(setCustomer)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar el cliente'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    )
  }
  if (!customer) {
    return <main className="p-6 text-sm text-destructive">{error ?? 'Cliente no encontrado'}</main>
  }

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <Link href="/customers" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Clientes
        </Link>
        <div className="mt-1 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-bold">{customer.name}</h1>
            <p className="text-xs text-muted-foreground">
              {customer.taxId} · {customer.customerType}
            </p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${customer.isActive ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
            {customer.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-4 p-4">
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <UserRound className="size-4 text-primary" /> Datos del cliente
          </h2>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Nombre / razón social</dt>
              <dd className="font-medium">{customer.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">RNC / cédula</dt>
              <dd className="font-medium">{customer.taxId}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Tipo</dt>
              <dd className="font-medium">{customer.customerType}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Estado</dt>
              <dd className="font-medium">{customer.isActive ? 'Activo' : 'Inactivo'}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Contacto</h2>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" /> {customer.phone || 'Sin teléfono'}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" /> {customer.email || 'Sin correo'}
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> {customer.address || 'Sin dirección'}
            </p>
          </div>
        </section>

        {customer.notes && (
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Notas</h2>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{customer.notes}</p>
          </section>
        )}

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Registro</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Creado</dt>
              <dd className="font-medium">{formatDate(customer.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Actualizado</dt>
              <dd className="font-medium">{formatDate(customer.updatedAt)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  )
}
