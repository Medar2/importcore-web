'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Loader2, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { vendorsService } from '@/features/vendors/services/vendors.service'
import type { Vendor } from '@/features/vendors/types'
import { withPermission } from '@/features/auth/components/permission-gate'
import { IMPORTCORE_PERMS } from '@/features/auth/utils/permissions'

function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : '—'
}

function VendorDetailPageContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    vendorsService
      .get(id)
      .then(setVendor)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar el proveedor'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    )
  }
  if (!vendor) {
    return <main className="p-6 text-sm text-destructive">{error ?? 'Proveedor no encontrado'}</main>
  }

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <Link href="/vendors" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Proveedores
        </Link>
        <div className="mt-1 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-bold">{vendor.name}</h1>
            <p className="text-xs text-muted-foreground">
              {vendor.tradeName ? `${vendor.tradeName} · ` : ''}{vendor.countryCode}
            </p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${vendor.isActive ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
            {vendor.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-4 p-4">
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <Building2 className="size-4 text-primary" /> Datos del proveedor
          </h2>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Nombre legal</dt>
              <dd className="font-medium">{vendor.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Nombre comercial</dt>
              <dd className="font-medium">{vendor.tradeName || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">País</dt>
              <dd className="font-medium">{vendor.countryCode}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Contacto</dt>
              <dd className="font-medium">{vendor.contact || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Términos de pago</dt>
              <dd className="font-medium">{vendor.paymentTerms || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Estado</dt>
              <dd className="font-medium">{vendor.isActive ? 'Activo' : 'Inactivo'}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <UserRound className="size-4 text-primary" /> Contacto
          </h2>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" /> {vendor.phone || 'Sin teléfono'}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" /> {vendor.email || 'Sin correo'}
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> {vendor.address || 'Sin dirección'}
            </p>
          </div>
        </section>

        {vendor.notes && (
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Notas</h2>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{vendor.notes}</p>
          </section>
        )}

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Registro</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Creado</dt>
              <dd className="font-medium">{formatDate(vendor.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Actualizado</dt>
              <dd className="font-medium">{formatDate(vendor.updatedAt)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  )
}

export default withPermission([IMPORTCORE_PERMS.VENDORS_READ], VendorDetailPageContent)
